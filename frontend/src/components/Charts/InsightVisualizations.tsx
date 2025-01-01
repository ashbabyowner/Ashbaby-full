import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import {
  IoAnalyticsOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import {
  TrendLineChart,
  ProgressAreaChart,
  ComparisonBarChart,
  InsightRadarChart,
  CorrelationScatterChart,
  TrendIndicator,
  InsightIndicator,
} from './InsightCharts';

interface InsightData {
  type: string;
  title: string;
  description: string;
  data: any[];
  metrics?: {
    [key: string]: number;
  };
  correlations?: {
    [key: string]: number;
  };
  recommendations?: string[];
}

interface InsightVisualizationProps {
  insight: InsightData;
}

export const InsightVisualization: React.FC<InsightVisualizationProps> = ({
  insight,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const renderChart = () => {
    switch (insight.type) {
      case 'trend':
        return <TrendLineChart data={insight.data} />;
      case 'progress':
        return <ProgressAreaChart data={insight.data} />;
      case 'comparison':
        return <ComparisonBarChart data={insight.data} />;
      case 'correlation':
        return <CorrelationScatterChart data={insight.data} />;
      case 'overview':
        return <InsightRadarChart data={insight.data} />;
      default:
        return null;
    }
  };

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <Icon
              as={IoAnalyticsOutline}
              boxSize={6}
              color="blue.500"
            />
            <Heading size="md">{insight.title}</Heading>
          </HStack>
          <Badge colorScheme="blue">{insight.type}</Badge>
        </HStack>

        <Text color="gray.600">{insight.description}</Text>

        <Box h="300px">{renderChart()}</Box>

        {insight.metrics && (
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            {Object.entries(insight.metrics).map(([key, value]) => (
              <Box key={key} p={4} borderRadius="md" borderWidth="1px">
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.500">
                    {key}
                  </Text>
                  <TrendIndicator
                    value={value}
                    label={key}
                    type={key.toLowerCase().includes('percentage') ? 'percentage' : 'value'}
                  />
                </VStack>
              </Box>
            ))}
          </Grid>
        )}

        {insight.correlations && (
          <VStack align="stretch" spacing={2}>
            <Heading size="sm">Correlations</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {Object.entries(insight.correlations).map(([key, value]) => (
                <Box key={key} p={4} borderRadius="md" borderWidth="1px">
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.500">
                      {key}
                    </Text>
                    <TrendIndicator
                      value={value * 100}
                      label={`Correlation with ${key}`}
                      type="percentage"
                    />
                  </VStack>
                </Box>
              ))}
            </Grid>
          </VStack>
        )}

        {insight.recommendations && (
          <VStack align="stretch" spacing={2}>
            <Heading size="sm">Recommendations</Heading>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              {insight.recommendations.map((recommendation, index) => (
                <InsightIndicator
                  key={index}
                  type="success"
                  message={recommendation}
                />
              ))}
            </Grid>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

interface InsightsDashboardProps {
  insights: InsightData[];
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  insights,
}) => {
  return (
    <Grid
      templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
      gap={6}
      w="100%"
    >
      {insights.map((insight, index) => (
        <InsightVisualization key={index} insight={insight} />
      ))}
    </Grid>
  );
};
