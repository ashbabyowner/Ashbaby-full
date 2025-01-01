import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoWalletOutline,
  IoAddOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoRepeatOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { useFinance } from '../../hooks/useFinance';
import { LineChart } from '../Charts/LineChart';
import { PieChart } from '../Charts/PieChart';

interface FinanceOverviewProps {
  compact?: boolean;
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const {
    accounts,
    transactions,
    budgets,
    insights,
    addTransaction,
    updateBudget,
    getFinancialAdvice,
    isLoading,
  } = useFinance();

  const MotionBox = motion(Box);

  const AccountCard = ({ account }: { account: any }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <HStack>
            <Icon
              as={IoWalletOutline}
              color={account.type === 'savings' ? 'blue.500' : 'green.500'}
              boxSize={5}
            />
            <Text fontWeight="medium">{account.name}</Text>
          </HStack>
          <Badge
            colorScheme={account.type === 'savings' ? 'blue' : 'green'}
            variant="subtle"
          >
            {account.type}
          </Badge>
        </HStack>

        <Stat>
          <StatNumber>${account.balance.toLocaleString()}</StatNumber>
          <StatHelpText>
            <StatArrow
              type={account.trend > 0 ? 'increase' : 'decrease'}
            />
            {Math.abs(account.trend)}% from last month
          </StatHelpText>
        </Stat>

        {account.alerts && account.alerts.length > 0 && (
          <HStack color="orange.500" fontSize="sm">
            <Icon as={IoAlertCircleOutline} />
            <Text>{account.alerts[0]}</Text>
          </HStack>
        )}
      </VStack>
    </MotionBox>
  );

  const BudgetCard = ({ budget }: { budget: any }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontWeight="medium">{budget.category}</Text>
          <Badge
            colorScheme={
              budget.spent / budget.limit > 0.9
                ? 'red'
                : budget.spent / budget.limit > 0.7
                ? 'orange'
                : 'green'
            }
            variant="subtle"
          >
            {((budget.spent / budget.limit) * 100).toFixed(0)}% used
          </Badge>
        </HStack>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">
            ${budget.spent.toLocaleString()} of ${budget.limit.toLocaleString()}
          </Text>
          <Text
            fontSize="sm"
            color={budget.spent > budget.limit ? 'red.500' : 'green.500'}
          >
            ${(budget.limit - budget.spent).toLocaleString()} remaining
          </Text>
        </HStack>

        <Box
          h="4px"
          bg="gray.100"
          borderRadius="full"
          overflow="hidden"
        >
          <Box
            h="100%"
            w={`${(budget.spent / budget.limit) * 100}%`}
            bg={
              budget.spent / budget.limit > 0.9
                ? 'red.500'
                : budget.spent / budget.limit > 0.7
                ? 'orange.500'
                : 'green.500'
            }
          />
        </Box>
      </VStack>
    </MotionBox>
  );

  const TransactionsList = () => (
    <Box
      overflowX="auto"
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Category</Th>
            <Th isNumeric>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction) => (
            <Tr key={transaction.id}>
              <Td>{new Date(transaction.date).toLocaleDateString()}</Td>
              <Td>
                <HStack>
                  {transaction.recurring && (
                    <Icon as={IoRepeatOutline} color="blue.500" />
                  )}
                  <Text>{transaction.description}</Text>
                </HStack>
              </Td>
              <Td>
                <Badge colorScheme="gray">{transaction.category}</Badge>
              </Td>
              <Td isNumeric>
                <Text
                  color={transaction.amount < 0 ? 'red.500' : 'green.500'}
                >
                  ${Math.abs(transaction.amount).toLocaleString()}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Finances
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addTransaction()}
          >
            Add Transaction
          </Button>
        </HStack>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          {accounts.slice(0, 2).map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={8}>
        {/* Accounts Overview */}
        <Box>
          <HStack mb={6} justify="space-between">
            <Text fontSize="2xl" fontWeight="bold">
              Financial Overview
            </Text>
            <HStack>
              <Button
                leftIcon={<IoTrendingUpOutline />}
                variant="outline"
                onClick={() => getFinancialAdvice()}
              >
                Get Insights
              </Button>
              <Button
                leftIcon={<IoAddOutline />}
                colorScheme="blue"
                onClick={() => addTransaction()}
              >
                Add Transaction
              </Button>
            </HStack>
          </HStack>

          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </Grid>
        </Box>

        {/* Budget Overview */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Budget Overview
          </Text>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={4}
          >
            {budgets.map((budget) => (
              <BudgetCard key={budget.category} budget={budget} />
            ))}
          </Grid>
        </Box>

        {/* Charts */}
        <Grid
          templateColumns={{
            base: '1fr',
            lg: 'repeat(2, 1fr)',
          }}
          gap={6}
        >
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Monthly Spending
            </Text>
            <LineChart
              data={insights.monthlySpending}
              categories={['Income', 'Expenses']}
              colors={['green.500', 'red.500']}
            />
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Spending by Category
            </Text>
            <PieChart
              data={insights.spendingByCategory}
              colors={[
                'blue.500',
                'green.500',
                'purple.500',
                'orange.500',
                'red.500',
              ]}
            />
          </Box>
        </Grid>

        {/* Recent Transactions */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Recent Transactions
          </Text>
          <TransactionsList />
        </Box>
      </VStack>
    </Box>
  );
};
