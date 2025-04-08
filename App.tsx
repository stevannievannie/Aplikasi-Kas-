import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transaction = {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  // Load transactions on app start
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const saved = await AsyncStorage.getItem('transactions');
        if (saved) setTransactions(JSON.parse(saved));
      } catch (error) {
        Alert.alert('Error', 'Failed to load transactions');
      }
    };
    loadTransactions();
  }, []);

  // Save transactions when they change
  useEffect(() => {
    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        Alert.alert('Error', 'Failed to save transactions');
      }
    };
    saveTransactions();
  }, [transactions]);

  const addTransaction = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: Number(amount),
      description,
      type,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setAmount('');
    setDescription('');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const getMonthlySummary = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense
    };
  };

  const summary = getMonthlySummary();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Income: Rp{summary.income.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Expense: Rp{summary.expense.toLocaleString()}</Text>
        <Text style={styles.summaryText}>Balance: Rp{summary.balance.toLocaleString()}</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <View style={styles.typeContainer}>
          <Button
            title="Income"
            color={type === 'income' ? 'green' : 'gray'}
            onPress={() => setType('income')}
          />
          <Button
            title="Expense"
            color={type === 'expense' ? 'red' : 'gray'}
            onPress={() => setType('expense')}
          />
        </View>
        <Button title="Add Transaction" onPress={addTransaction} />
      </View>

      <FlatList
        style={styles.list}
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.transactionItem,
            { borderLeftColor: item.type === 'income' ? 'green' : 'red' }
          ]}>
            <View style={styles.transactionInfo}>
              <Text>{item.description}</Text>
              <Text style={{ color: item.type === 'income' ? 'green' : 'red' }}>
                {item.type === 'income' ? '+' : '-'}Rp{item.amount.toLocaleString()}
              </Text>
            </View>
            <Button title="Delete" onPress={() => deleteTransaction(item.id)} color="red" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  summaryContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderLeftWidth: 5,
  },
  transactionInfo: {
    flex: 1,
  },
});
