import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  Badge,
  Progress,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  IoAnalyticsOutline,
  IoArrowForwardOutline,
  IoBulbOutline,
  IoCheckmarkCircleOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
} from 'react-icons/io5';

interface AIInsight {
  type: string;
  title: string;
  description: string;
  recommendations: string[];
  relatedAreas: string[];
  confidence: number;
  timestamp: string;
}

interface AIInsightsProps {
  insights: AIInsight[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getInsightIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'trend':
        return IoTrendingUpOutline;
      case 'recommendation':
        return IoBulbOutline;
      case 'warning':
        return IoWarningOutline;
      case 'achievement':
        return IoCheckmarkCircleOutline;
      default:
        return IoAnalyticsOutline;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'trend':
        return 'blue';
      case 'recommendation':
        return 'purple';
      case 'warning':
        return 'orange';
      case 'achievement':
        return 'green';
      default:
        return 'gray';
    }
  };

  const InsightCard = ({ insight }: { insight: AIInsight }) => (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <HStack>
            <Icon
              as={getInsightIcon(insight.type)}
              color={`${getInsightColor(insight.type)}.500`}
              boxSize={5}
            />
            <Text fontWeight="medium">{insight.title}</Text>
          </HStack>
          <Badge colorScheme={getInsightColor(insight.type)}>
            {insight.type}
          </Badge>
        </HStack>

        <Text color="gray.600">{insight.description}</Text>

        {insight.recommendations.length > 0 && (
          <Box>
            <Text fontWeight="medium" mb={2}>
              Recommendations:
            </Text>
            <List spacing={2}>
              {insight.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <HStack>
                    <ListIcon as={IoArrowForwardOutline} color="blue.500" />
                    <Text>{rec}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <HStack spacing={4}>
          <HStack>
            <Text fontSize="sm" color="gray.500">
              Confidence:
            </Text>
            <Progress
              value={insight.confidence}
              colorScheme={getInsightColor(insight.type)}
              size="sm"
              width="100px"
              borderRadius="full"
            />
            <Text fontSize="sm" color="gray.500">
              {insight.confidence}%
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {new Date(insight.timestamp).toLocaleString()}
          </Text>
        </HStack>

        {insight.relatedAreas.length > 0 && (
          <HStack spacing={2}>
            {insight.relatedAreas.map((area) => (
              <Badge key={area} variant="subtle">
                {area}
              </Badge>
            ))}
          </HStack>
        )}
      </VStack>
    </Box>
  );

  return (
    <VStack align="stretch" spacing={4}>
      {insights.map((insight, index) => (
        <InsightCard key={index} insight={insight} />
      ))}
    </VStack>
  );
};
