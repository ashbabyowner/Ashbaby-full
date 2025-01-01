import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoHeartOutline,
  IoWalkOutline,
  IoWaterOutline,
  IoMoonOutline,
} from 'react-icons/io5';
import { LineChart } from '../Charts/LineChart';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';

interface HealthMetricsProps {
  compact?: boolean;
}

export const HealthMetrics: React.FC<HealthMetricsProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { metrics, trends, isLoading } = useHealthMetrics();

  const MotionBox = motion(Box);

  const MetricCard = ({
    icon,
    label,
    value,
    unit,
    trend,
    color,
  }: {
    icon: React.ReactElement;
    label: string;
    value: number;
    unit: string;
    trend?: number;
    color: string;
  }) => (
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
      <VStack align="stretch" spacing={2}>
        <HStack justify="space-between">
          <Icon as={icon} boxSize={6} color={color} />
          <Text fontSize="sm" color="gray.500">
            {label}
          </Text>
        </HStack>
        <Stat>
          <StatNumber>
            {value}
            <Text as="span" fontSize="sm" ml={1}>
              {unit}
            </Text>
          </StatNumber>
          {trend && (
            <StatHelpText>
              <StatArrow
                type={trend > 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(trend)}%
            </StatHelpText>
          )}
        </Stat>
        <Progress
          value={(value / metrics.goals[label.toLowerCase()]) * 100}
          colorScheme={color.replace('.", ""')}
          size="sm"
          borderRadius="full"
        />
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Health Overview
          </Text>
          <Text fontSize="sm" color="gray.500">
            Today
          </Text>
        </HStack>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <MetricCard
            icon={<IoHeartOutline />}
            label="Heart Rate"
            value={metrics.heartRate}
            unit="bpm"
            trend={trends.heartRate}
            color="red.500"
          />
          <MetricCard
            icon={<IoWalkOutline />}
            label="Steps"
            value={metrics.steps}
            unit="steps"
            trend={trends.steps}
            color="green.500"
          />
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Health Metrics
      </Text>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={6}
      >
        <MetricCard
          icon={<IoHeartOutline />}
          label="Heart Rate"
          value={metrics.heartRate}
          unit="bpm"
          trend={trends.heartRate}
          color="red.500"
        />
        <MetricCard
          icon={<IoWalkOutline />}
          label="Steps"
          value={metrics.steps}
          unit="steps"
          trend={trends.steps}
          color="green.500"
        />
        <MetricCard
          icon={<IoWaterOutline />}
          label="Hydration"
          value={metrics.hydration}
          unit="ml"
          trend={trends.hydration}
          color="blue.500"
        />
        <MetricCard
          icon={<IoMoonOutline />}
          label="Sleep"
          value={metrics.sleep}
          unit="hrs"
          trend={trends.sleep}
          color="purple.500"
        />
      </Grid>

      <Box mt={8}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Weekly Trends
        </Text>
        <LineChart
          data={metrics.weeklyData}
          categories={['Heart Rate', 'Steps', 'Hydration', 'Sleep']}
          colors={['red.500', 'green.500', 'blue.500', 'purple.500']}
        />
      </Box>
    </Box>
  );
};
