import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function Home() {
  const [conselho, setConselho] = useState(''); // Armazena o conselho já traduzido
  const [carregando, setCarregando] = useState(true); // Indica se a tela está carregando
  const navigation = useNavigation(); // Navegação entre as telas

  useEffect(() => {
    buscarConselhoTraduzido();
  }, []);

  // Vai buscar o conselho do dia e traduzi-lo
  const buscarConselhoTraduzido = async () => {
    try {
      // Busca o conselho na API
      const respostaConselho = await axios.get('https://api.adviceslip.com/advice');
      const textoConselho = respostaConselho.data.slip.advice; // Extrai o conselho do JSON da resposta

      // Traduz o conselho do dia 
      const respostaTraducao = await axios.post(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURI(textoConselho)}`
      );

      const textoTraduzido = respostaTraducao.data[0][0][0]; // Busca o texto traduzido da resposta
      setConselho(textoTraduzido); // Armazena o conselho traduzido
    } catch (erro) {
      console.error('Erro ao buscar ou traduzir o conselho:', erro);
      Alert.alert('Erro', 'Não foi possível carregar o conselho. Tente novamente mais tarde.');
      setConselho('Erro ao carregar conselho.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conselho do Dia</Text>
      {carregando ? (
        <ActivityIndicator size="large" color="#BB86FC" />
      ) : (
        <Text style={styles.advice}>{conselho}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Tarefas')}>
        <Text style={styles.buttonText}>Ver Tarefas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#BB86FC',
    marginBottom: 20,
  },
  advice: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#BB86FC',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
