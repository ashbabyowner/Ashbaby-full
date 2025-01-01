import React, { useState } from 'react';
import { Box, Grid, Typography, Tab, Tabs } from '@mui/material';
import BudgetOverview, {
  defaultCategories,
} from '../components/finance/BudgetOverview';
import TransactionList from '../components/finance/TransactionList';
import SavingsGoals from '../components/finance/SavingsGoals';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Finance: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Sample data - replace with actual data from your API
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      date: '2023-12-30',
      description: 'Grocery Shopping',
      amount: 150.75,
      category: 'Food',
      type: 'expense' as const,
    },
    {
      id: '2',
      date: '2023-12-29',
      description: 'Monthly Salary',
      amount: 5000,
      category: 'Income',
      type: 'income' as const,
    },
    {
      id: '3',
      date: '2023-12-28',
      description: 'Internet Bill',
      amount: 79.99,
      category: 'Housing',
      type: 'expense' as const,
    },
  ]);

  const [savingsGoals, setSavingsGoals] = useState([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5000,
      targetDate: '2024-06-30',
      description: 'Building a 6-month emergency fund',
    },
    {
      id: '2',
      name: 'New Car',
      targetAmount: 25000,
      currentAmount: 15000,
      targetDate: '2024-12-31',
      description: 'Saving for a new electric vehicle',
    },
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddTransaction = (
    transaction: Omit<(typeof transactions)[0], 'id'>
  ) => {
    setTransactions([
      {
        ...transaction,
        id: String(Date.now()),
      },
      ...transactions,
    ]);
  };

  const handleEditTransaction = (
    updatedTransaction: (typeof transactions)[0]
  ) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(
      transactions.filter((transaction) => transaction.id !== id)
    );
  };

  const handleAddSavingsGoal = (
    goal: Omit<(typeof savingsGoals)[0], 'id'>
  ) => {
    setSavingsGoals([
      {
        ...goal,
        id: String(Date.now()),
      },
      ...savingsGoals,
    ]);
  };

  const handleEditSavingsGoal = (
    updatedGoal: (typeof savingsGoals)[0]
  ) => {
    setSavingsGoals(
      savingsGoals.map((goal) =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      )
    );
  };

  const handleDeleteSavingsGoal = (id: string) => {
    setSavingsGoals(savingsGoals.filter((goal) => goal.id !== id));
  };

  // Calculate total income and expenses
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get unique categories from transactions
  const categories = Array.from(
    new Set(transactions.map((t) => t.category))
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Financial Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="finance management tabs"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Transactions" />
          <Tab label="Savings Goals" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BudgetOverview
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              categories={defaultCategories}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TransactionList
              transactions={transactions.slice(0, 5)}
              categories={categories}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SavingsGoals
              goals={savingsGoals}
              onAddGoal={handleAddSavingsGoal}
              onEditGoal={handleEditSavingsGoal}
              onDeleteGoal={handleDeleteSavingsGoal}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TransactionList
          transactions={transactions}
          categories={categories}
          onAddTransaction={handleAddTransaction}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SavingsGoals
          goals={savingsGoals}
          onAddGoal={handleAddSavingsGoal}
          onEditGoal={handleEditSavingsGoal}
          onDeleteGoal={handleDeleteSavingsGoal}
        />
      </TabPanel>
    </Box>
  );
};

export default Finance;
