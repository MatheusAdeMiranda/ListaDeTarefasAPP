import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Tarefas() {
  const [tarefa, setTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);
  const [dia, setDia] = useState('');

  // Vai carregar as tarefas ao iniciar 
  useEffect(() => {
    carregarTarefas();
  }, []);

  // Busca as tarefas que estão salva no AsyncStorage
  const carregarTarefas = async () => {
    try {
      const tarefasSalvas = await AsyncStorage.getItem('@tarefas');
      if (tarefasSalvas) {
        setTarefas(JSON.parse(tarefasSalvas));
      }
    } catch (erro) {
      console.error('Erro ao carregar tarefas:', erro);
    }
  };

  // Salva as tarefas no AsyncStorage
  const salvarTarefas = async (novasTarefas) => {
    try {
      await AsyncStorage.setItem('@tarefas', JSON.stringify(novasTarefas));
    } catch (erro) {
      console.error('Erro ao salvar tarefas:', erro);
    }
  };

  const validarDia = (input) => {
    const numeroDia = parseInt(input, 10);
    if (isNaN(numeroDia) || numeroDia < 1 || numeroDia > 31) {
      Alert.alert('Erro', 'Por favor, insira um número de 1 a 31.');
      setDia('');
    } else {
      setDia(input);
    }
  };

  const adicionarTarefa = () => {
    if (tarefa.trim() === '') {
      Alert.alert('Erro', 'Digite uma tarefa válida!');
      return;
    }

    if (!dia) {
      Alert.alert('Erro', 'Insira um dia válido.');
      return;
    }

    const novaTarefa = { id: Date.now().toString(), text: tarefa, day: dia, completed: false };
    const tarefasAtualizadas = [...tarefas, novaTarefa];
    setTarefas(tarefasAtualizadas);
    salvarTarefas(tarefasAtualizadas); // Salva a lista atualizada
    setTarefa(''); // Limpa o campo de texto tarefa
    setDia('');// Limpa =
  };


  const alternarConclusaoTarefa = (id) => {
    const tarefasAtualizadas = tarefas.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTarefas(tarefasAtualizadas);
    salvarTarefas(tarefasAtualizadas); // Salva a lista atualizada com a mudança
  };

  const excluirTarefa = (id) => {
    const tarefasAtualizadas = tarefas.filter((t) => t.id !== id);
    setTarefas(tarefasAtualizadas);
    salvarTarefas(tarefasAtualizadas); // Salva a lista atualizada depois da exclusão
  };

  const obterPorcentagemConclusao = () => {
    const totalTarefas = tarefas.length;
    const tarefasConcluidas = tarefas.filter(tarefa => tarefa.completed).length;
    return totalTarefas > 0 ? (tarefasConcluidas / totalTarefas * 100).toFixed(2) : 0;
  };

  const obterUrlGrafico = () => {
    const porcentagemConclusao = obterPorcentagemConclusao();
    return `https://image-charts.com/chart?cht=bhs&chs=600x20&chd=t:${porcentagemConclusao}&chco=ff0080,8000ff&chds=0,100&chf=bg,s,FFFFFF00`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Image 
          source={{ uri: obterUrlGrafico() }} 
          style={styles.chart} 
          resizeMode="contain" 
        />
        <Text style={styles.percentageText}>{obterPorcentagemConclusao()}%</Text>
      </View>

      <Text style={styles.title}>Minhas Tarefas</Text>

      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={[styles.checkButton, item.completed && styles.checkButtonCompleted]}
              onPress={() => alternarConclusaoTarefa(item.id)}
            >
              {item.completed && <AntDesign name="check" size={20} color="#fff" />}
            </TouchableOpacity>
            <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>
              {item.text} (Dia: {item.day})
            </Text>
            <TouchableOpacity onPress={() => excluirTarefa(item.id)}>
              <AntDesign name="delete" size={24} color="#BB86FC" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma tarefa adicionada ainda!</Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova tarefa"
          placeholderTextColor="#777"
          value={tarefa}
          onChangeText={setTarefa}
        />
        <TextInput
          style={[styles.input, { width: 60, marginLeft: 10 }]}
          placeholder="Dia"
          placeholderTextColor="#777"
          keyboardType="numeric"
          value={dia}
          onChangeText={validarDia}
        />
        <TouchableOpacity style={styles.addButton} onPress={adicionarTarefa}>
          <AntDesign name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#BB86FC',
    textAlign: 'center',
    marginVertical: 10,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chart: {
    width: '80%',
    height: 20,
  },
  percentageText: {
    color: '#BB86FC',
    fontSize: 18,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#BB86FC',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BB86FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#BB86FC',
  },
  taskText: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#777',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
});
