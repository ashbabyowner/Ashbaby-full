import React from 'react';
import {
  Box,
  useColorModeValue,
  Text,
  HStack,
  VStack,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
} from 'recharts';

interface ChartProps {
  data: any[];
  height?: number;
  colors?: string[];
}

export const TrendLineChart: React.FC<ChartProps> = ({
  data,
  height = 300,
  colors = ['#4299E1', '#48BB78', '#F6AD55'],
}) => {
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box h={`${height}px`} w="100%">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {data[0] && Object.keys(data[0])
            .filter(key => key !== 'name')
            .map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const ProgressAreaChart: React.FC<ChartProps> = ({
  data,
  height = 300,
  colors = ['#4299E1', '#48BB78'],
}) => {
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box h={`${height}px`} w="100%">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {data[0] && Object.keys(data[0])
            .filter(key => key !== 'name')
            .map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
              />
            ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const ComparisonBarChart: React.FC<ChartProps> = ({
  data,
  height = 300,
  colors = ['#4299E1', '#48BB78', '#F6AD55'],
}) => {
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box h={`${height}px`} w="100%">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {data[0] && Object.keys(data[0])
            .filter(key => key !== 'name')
            .map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const InsightRadarChart: React.FC<ChartProps> = ({
  data,
  height = 300,
  colors = ['#4299E1'],
}) => {
  return (
    <Box h={`${height}px`} w="100%">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          {data[0] && Object.keys(data[0])
            .filter(key => key !== 'subject')
            .map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const CorrelationScatterChart: React.FC<ChartProps> = ({
  data,
  height = 300,
  colors = ['#4299E1'],
}) => {
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box h={`${height}px`} w="100%">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis type="number" dataKey="x" name="x" />
          <YAxis type="number" dataKey="y" name="y" />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          {data[0] && Object.keys(data[0])
            .filter(key => key !== 'x' && key !== 'y')
            .map((key, index) => (
              <Scatter
                key={key}
                name={key}
                data={data}
                fill={colors[index % colors.length]}
              />
            ))}
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface TrendIndicatorProps {
  value: number;
  label: string;
  type?: 'percentage' | 'value';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  label,
  type = 'percentage',
}) => {
  const isPositive = value > 0;
  const color = isPositive ? 'green.500' : 'red.500';

  return (
    <Tooltip label={`${label}: ${value}${type === 'percentage' ? '%' : ''}`}>
      <HStack spacing={2} color={color}>
        <Icon
          as={isPositive ? IoTrendingUpOutline : IoTrendingDownOutline}
          boxSize={5}
        />
        <Text fontWeight="medium">
          {isPositive ? '+' : ''}
          {value}
          {type === 'percentage' ? '%' : ''}
        </Text>
      </HStack>
    </Tooltip>
  );
};

interface InsightIndicatorProps {
  type: 'warning' | 'success';
  message: string;
}

export const InsightIndicator: React.FC<InsightIndicatorProps> = ({
  type,
  message,
}) => {
  const color = type === 'warning' ? 'orange.500' : 'green.500';
  const icon = type === 'warning' ? IoWarningOutline : IoCheckmarkCircleOutline;

  return (
    <Tooltip label={message}>
      <HStack spacing={2} color={color}>
        <Icon as={icon} boxSize={5} />
        <Text fontWeight="medium">{message}</Text>
      </HStack>
    </Tooltip>
  );
};
