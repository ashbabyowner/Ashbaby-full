import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  IoMenuOutline,
  IoBookmarkOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
} from 'react-icons/io5';
import { AIChat } from './AIChat';
import { InsightsDashboard } from '../Charts/InsightVisualizations';

interface SavedConversation {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  tags: string[];
}

interface AIPreference {
  key: string;
  label: string;
  value: boolean | string | number;
  type: 'toggle' | 'select' | 'slider';
  options?: string[];
  min?: number;
  max?: number;
}

export const AIChatContainer: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [preferences, setPreferences] = useState<AIPreference[]>([
    {
      key: 'autoSuggestions',
      label: 'Auto Suggestions',
      value: true,
      type: 'toggle',
    },
    {
      key: 'responseStyle',
      label: 'Response Style',
      value: 'balanced',
      type: 'select',
      options: ['concise', 'balanced', 'detailed'],
    },
    {
      key: 'confidenceThreshold',
      label: 'Confidence Threshold',
      value: 0.7,
      type: 'slider',
      min: 0,
      max: 1,
    },
  ]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.key === key ? { ...pref, value } : pref
      )
    );
  };

  const renderSavedConversations = () => (
    <VStack align="stretch" spacing={4}>
      {savedConversations.map(conversation => (
        <Box
          key={conversation.id}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          cursor="pointer"
          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
        >
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Heading size="sm">{conversation.title}</Heading>
              <Text fontSize="sm" color="gray.500">
                {conversation.timestamp.toLocaleDateString()}
              </Text>
            </HStack>
            <Text noOfLines={2} fontSize="sm" color="gray.600">
              {conversation.preview}
            </Text>
            <HStack>
              {conversation.tags.map((tag, index) => (
                <Badge key={index} colorScheme="blue">
                  {tag}
                </Badge>
              ))}
            </HStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );

  const renderPreferences = () => (
    <VStack align="stretch" spacing={4}>
      {preferences.map(pref => (
        <Box key={pref.key}>
          <Text mb={2}>{pref.label}</Text>
          {pref.type === 'toggle' && (
            <Switch
              isChecked={pref.value as boolean}
              onChange={e =>
                handlePreferenceChange(pref.key, e.target.checked)
              }
            />
          )}
          {pref.type === 'select' && (
            <Select
              value={pref.value as string}
              onChange={e =>
                handlePreferenceChange(pref.key, e.target.value)
              }
            >
              {pref.options?.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
          {pref.type === 'slider' && (
            <Slider
              value={pref.value as number}
              min={pref.min}
              max={pref.max}
              step={0.1}
              onChange={value => handlePreferenceChange(pref.key, value)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          )}
        </Box>
      ))}
    </VStack>
  );

  const renderHelp = () => (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Heading size="sm" mb={2}>
          Quick Start
        </Heading>
        <Text>
          Start typing your message in the chat box below. You can ask
          questions, request analysis, or get recommendations across
          different areas of your life.
        </Text>
      </Box>
      <Divider />
      <Box>
        <Heading size="sm" mb={2}>
          Features
        </Heading>
        <VStack align="stretch" spacing={2}>
          <Text>• Natural language conversations</Text>
          <Text>• File attachments support</Text>
          <Text>• Voice input capability</Text>
          <Text>• Cross-component insights</Text>
          <Text>• Data visualization</Text>
        </VStack>
      </Box>
      <Divider />
      <Box>
        <Heading size="sm" mb={2}>
          Tips
        </Heading>
        <VStack align="stretch" spacing={2}>
          <Text>• Be specific in your questions</Text>
          <Text>• Use context from different areas</Text>
          <Text>• Save important conversations</Text>
          <Text>• Adjust preferences for better results</Text>
        </VStack>
      </Box>
    </VStack>
  );

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      <HStack
        p={4}
        borderBottomWidth={1}
        borderColor={borderColor}
        bg={bgColor}
      >
        <IconButton
          aria-label="Menu"
          icon={<IoMenuOutline />}
          onClick={onOpen}
        />
        <Heading size="md">AI Assistant</Heading>
      </HStack>

      <Box flex={1} p={4} overflowY="auto">
        <AIChat />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>AI Assistant</DrawerHeader>

          <DrawerBody>
            <Tabs>
              <TabList>
                <Tab>
                  <HStack>
                    <IoBookmarkOutline />
                    <Text>Saved</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <IoSettingsOutline />
                    <Text>Settings</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <IoHelpCircleOutline />
                    <Text>Help</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>{renderSavedConversations()}</TabPanel>
                <TabPanel>{renderPreferences()}</TabPanel>
                <TabPanel>{renderHelp()}</TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
