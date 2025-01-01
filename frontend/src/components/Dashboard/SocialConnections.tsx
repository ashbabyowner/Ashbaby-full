import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Avatar,
  AvatarGroup,
  Badge,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoPersonAddOutline,
  IoChatbubblesOutline,
  IoHeartOutline,
  IoTrophyOutline,
  IoCalendarOutline,
} from 'react-icons/io5';
import { useSocialConnections } from '../../hooks/useSocialConnections';

interface SocialConnectionsProps {
  compact?: boolean;
}

export const SocialConnections: React.FC<SocialConnectionsProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { connections, groups, challenges, addConnection, joinGroup, createChallenge, isLoading } = useSocialConnections();

  const MotionBox = motion(Box);

  const ConnectionCard = ({ connection }: { connection: any }) => (
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
      <HStack spacing={4}>
        <Avatar
          name={connection.name}
          src={connection.avatar}
          size="md"
        />
        <VStack align="start" flex="1" spacing={1}>
          <HStack justify="space-between" width="100%">
            <Text fontWeight="medium">{connection.name}</Text>
            <Badge
              colorScheme={connection.online ? 'green' : 'gray'}
              variant="subtle"
            >
              {connection.online ? 'Online' : 'Offline'}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {connection.status}
          </Text>
          <HStack spacing={4} fontSize="sm">
            <HStack>
              <Icon as={IoTrophyOutline} />
              <Text>{connection.achievements}</Text>
            </HStack>
            <HStack>
              <Icon as={IoHeartOutline} />
              <Text>{connection.kudos}</Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    </MotionBox>
  );

  const GroupCard = ({ group }: { group: any }) => (
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
          <Text fontWeight="medium">{group.name}</Text>
          <Badge colorScheme={group.category} variant="subtle">
            {group.category}
          </Badge>
        </HStack>

        <Text fontSize="sm" color="gray.500" noOfLines={2}>
          {group.description}
        </Text>

        <HStack justify="space-between">
          <AvatarGroup size="sm" max={3}>
            {group.members.map((member: any) => (
              <Avatar
                key={member.id}
                name={member.name}
                src={member.avatar}
              />
            ))}
          </AvatarGroup>
          <Text fontSize="sm" color="gray.500">
            {group.members.length} members
          </Text>
        </HStack>

        <Button
          leftIcon={<IoChatbubblesOutline />}
          size="sm"
          variant="ghost"
          width="100%"
        >
          Join Discussion
        </Button>
      </VStack>
    </MotionBox>
  );

  const ChallengeCard = ({ challenge }: { challenge: any }) => (
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
          <Text fontWeight="medium">{challenge.title}</Text>
          <Badge
            colorScheme={challenge.status === 'active' ? 'green' : 'gray'}
            variant="subtle"
          >
            {challenge.status}
          </Badge>
        </HStack>

        <Text fontSize="sm" color="gray.500">
          {challenge.description}
        </Text>

        <HStack fontSize="sm">
          <Icon as={IoCalendarOutline} />
          <Text>{challenge.duration}</Text>
          <Text color="gray.500">•</Text>
          <Text>{challenge.participants.length} participants</Text>
        </HStack>

        <Button
          leftIcon={<IoTrophyOutline />}
          size="sm"
          colorScheme="blue"
          variant="outline"
          width="100%"
        >
          Join Challenge
        </Button>
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Social
          </Text>
          <Button
            leftIcon={<IoPersonAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addConnection()}
          >
            Connect
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {connections.slice(0, 3).map((connection) => (
            <ConnectionCard key={connection.id} connection={connection} />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={8}>
        {/* Connections Section */}
        <Box>
          <HStack mb={6} justify="space-between">
            <Text fontSize="2xl" fontWeight="bold">
              Connections
            </Text>
            <Button
              leftIcon={<IoPersonAddOutline />}
              colorScheme="blue"
              onClick={() => addConnection()}
            >
              Add Connection
            </Button>
          </HStack>

          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {connections.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))}
          </Grid>
        </Box>

        <Divider />

        {/* Groups Section */}
        <Box>
          <HStack mb={6} justify="space-between">
            <Text fontSize="xl" fontWeight="bold">
              Groups
            </Text>
            <Button
              variant="outline"
              onClick={() => joinGroup()}
            >
              Browse Groups
            </Button>
          </HStack>

          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </Grid>
        </Box>

        <Divider />

        {/* Challenges Section */}
        <Box>
          <HStack mb={6} justify="space-between">
            <Text fontSize="xl" fontWeight="bold">
              Active Challenges
            </Text>
            <Button
              leftIcon={<IoTrophyOutline />}
              colorScheme="blue"
              variant="outline"
              onClick={() => createChallenge()}
            >
              Create Challenge
            </Button>
          </HStack>

          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
};
