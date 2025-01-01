import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Tag,
  TagLabel,
  TagLeftIcon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Textarea,
  Input,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoAddOutline,
  IoBookOutline,
  IoCalendarOutline,
  IoEllipsisVerticalOutline,
  IoHappyOutline,
  IoHeartOutline,
  IoImageOutline,
  IoLocationOutline,
  IoMicOutline,
  IoSaveOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { useJournal } from '../../hooks/useJournal';
import { AIInsights } from '../AI/AIInsights';

interface JournalEntriesProps {
  compact?: boolean;
}

export const JournalEntries: React.FC<JournalEntriesProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const {
    entries,
    tags,
    insights,
    addEntry,
    deleteEntry,
    updateEntry,
    getAIInsights,
    isLoading,
  } = useJournal();

  const MotionBox = motion(Box);

  const JournalCard = ({
    entry,
    showActions = true,
  }: {
    entry: any;
    showActions?: boolean;
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
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <HStack>
            <Icon
              as={IoBookOutline}
              color={entry.mood === 'happy' ? 'green.500' : 'blue.500'}
              boxSize={5}
            />
            <Text fontWeight="medium">{entry.title}</Text>
          </HStack>
          {showActions && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<IoEllipsisVerticalOutline />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem
                  icon={<IoTrashOutline />}
                  onClick={() => deleteEntry(entry.id)}
                >
                  Delete
                </MenuItem>
                <MenuItem
                  icon={<IoSaveOutline />}
                  onClick={() => updateEntry(entry.id)}
                >
                  Save
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.500" noOfLines={3}>
          {entry.content}
        </Text>

        <HStack spacing={2} flexWrap="wrap">
          {entry.tags.map((tag: string) => (
            <Tag
              key={tag}
              size="sm"
              variant="subtle"
              colorScheme="blue"
            >
              <TagLabel>{tag}</TagLabel>
            </Tag>
          ))}
        </HStack>

        <HStack justify="space-between" fontSize="sm" color="gray.500">
          <HStack>
            <Icon as={IoCalendarOutline} />
            <Text>
              {new Date(entry.date).toLocaleDateString()}
            </Text>
          </HStack>
          <HStack>
            <Icon as={IoLocationOutline} />
            <Text>{entry.location}</Text>
          </HStack>
        </HStack>

        {entry.mood && (
          <HStack>
            <Icon
              as={IoHappyOutline}
              color={entry.mood === 'happy' ? 'green.500' : 'blue.500'}
            />
            <Text fontSize="sm">
              Feeling {entry.mood}
            </Text>
          </HStack>
        )}

        {showActions && entry.media && entry.media.length > 0 && (
          <HStack spacing={2}>
            {entry.media.map((item: any, index: number) => (
              <Icon
                key={index}
                as={item.type === 'image' ? IoImageOutline : IoMicOutline}
                color="blue.500"
              />
            ))}
          </HStack>
        )}
      </VStack>
    </MotionBox>
  );

  const NewEntryForm = () => (
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
      <VStack align="stretch" spacing={4}>
        <Input placeholder="Title" size="lg" />
        <Textarea
          placeholder="Write your thoughts..."
          size="lg"
          minH="200px"
        />
        <HStack>
          <Button leftIcon={<IoImageOutline />} variant="ghost">
            Add Image
          </Button>
          <Button leftIcon={<IoMicOutline />} variant="ghost">
            Add Voice Note
          </Button>
          <Button leftIcon={<IoLocationOutline />} variant="ghost">
            Add Location
          </Button>
        </HStack>
        <HStack justify="space-between">
          <HStack>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<IoHappyOutline />}
                variant="ghost"
              >
                Mood
              </MenuButton>
              <MenuList>
                <MenuItem>😊 Happy</MenuItem>
                <MenuItem>😐 Neutral</MenuItem>
                <MenuItem>😔 Sad</MenuItem>
                <MenuItem>😤 Angry</MenuItem>
                <MenuItem>😌 Peaceful</MenuItem>
              </MenuList>
            </Menu>
            <Button leftIcon={<IoHeartOutline />} variant="ghost">
              Add Tags
            </Button>
          </HStack>
          <Button
            leftIcon={<IoSaveOutline />}
            colorScheme="blue"
            onClick={() => addEntry()}
          >
            Save Entry
          </Button>
        </HStack>
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Journal
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addEntry()}
          >
            New Entry
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {entries.slice(0, 2).map((entry) => (
            <JournalCard key={entry.id} entry={entry} showActions={false} />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Journal Entries
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            colorScheme="blue"
            onClick={() => addEntry()}
          >
            New Entry
          </Button>
        </HStack>

        {/* New Entry Form */}
        <NewEntryForm />

        {/* AI Insights */}
        {insights && (
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              AI Insights
            </Text>
            <AIInsights insights={insights} />
          </Box>
        )}

        {/* Journal Entries */}
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {entries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </Grid>

        {/* Popular Tags */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Popular Tags
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {tags.map((tag) => (
              <Tag
                key={tag.name}
                size="md"
                variant="subtle"
                colorScheme="blue"
                cursor="pointer"
              >
                <TagLeftIcon as={tag.icon} />
                <TagLabel>{tag.name}</TagLabel>
              </Tag>
            ))}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};
