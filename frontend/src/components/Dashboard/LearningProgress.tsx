import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Progress,
  Badge,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoBookOutline,
  IoAddOutline,
  IoSchoolOutline,
  IoTimeOutline,
  IoTrophyOutline,
} from 'react-icons/io5';
import { useLearning } from '../../hooks/useLearning';
import { LineChart } from '../Charts/LineChart';

interface LearningProgressProps {
  compact?: boolean;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { courses, skills, addCourse, updateProgress, getRecommendations, isLoading } = useLearning();

  const MotionBox = motion(Box);

  const CourseCard = ({
    course,
    showDetails = true,
  }: {
    course: any;
    showDetails?: boolean;
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
              color={`${course.category}.500`}
              boxSize={5}
            />
            <Text fontWeight="medium">{course.title}</Text>
          </HStack>
          <Badge
            colorScheme={course.category}
            variant="subtle"
            borderRadius="full"
          >
            {course.category}
          </Badge>
        </HStack>

        <Progress
          value={course.progress}
          colorScheme={course.category}
          size="sm"
          borderRadius="full"
        />

        <HStack justify="space-between" fontSize="sm">
          <HStack>
            <Icon as={IoTimeOutline} />
            <Text>{course.duration}</Text>
          </HStack>
          <Text color="gray.500">
            {course.progress}% Complete
          </Text>
        </HStack>

        {showDetails && (
          <Accordion allowToggle>
            <AccordionItem border="none">
              <AccordionButton px={0}>
                <Box flex="1" textAlign="left">
                  <Text fontSize="sm" fontWeight="medium">
                    Modules
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} px={0}>
                <VStack align="stretch" spacing={2}>
                  {course.modules.map((module: any, index: number) => (
                    <HStack key={index} justify="space-between">
                      <Text fontSize="sm">{module.title}</Text>
                      <Badge
                        colorScheme={module.completed ? 'green' : 'gray'}
                        variant="subtle"
                      >
                        {module.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </VStack>
    </MotionBox>
  );

  const SkillCard = ({ skill }: { skill: any }) => (
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
          <Text fontWeight="medium">{skill.name}</Text>
          <Badge colorScheme="purple" variant="subtle">
            Level {skill.level}
          </Badge>
        </HStack>

        <Progress
          value={(skill.experience / skill.nextLevelXP) * 100}
          colorScheme="purple"
          size="sm"
          borderRadius="full"
        />

        <HStack justify="space-between" fontSize="sm">
          <Text color="gray.500">
            {skill.experience}/{skill.nextLevelXP} XP
          </Text>
          <HStack>
            <Icon as={IoTrophyOutline} />
            <Text>{skill.achievements} achievements</Text>
          </HStack>
        </HStack>
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Learning Progress
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addCourse()}
          >
            Add Course
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {courses.slice(0, 2).map((course) => (
            <CourseCard key={course.id} course={course} showDetails={false} />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack mb={6} justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Learning Journey
        </Text>
        <HStack>
          <Button
            leftIcon={<IoSchoolOutline />}
            variant="outline"
            onClick={() => getRecommendations()}
          >
            Get Recommendations
          </Button>
          <Button
            leftIcon={<IoAddOutline />}
            colorScheme="blue"
            onClick={() => addCourse()}
          >
            Add Course
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
        mb={8}
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </Grid>

      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Skills Progress
      </Text>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={4}
      >
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </Grid>

      <Box mt={8}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Learning Activity
        </Text>
        <LineChart
          data={courses.map((course) => ({
            name: course.title,
            data: course.activityData,
          }))}
          categories={['Study Hours']}
          colors={['blue.500', 'purple.500', 'green.500']}
        />
      </Box>
    </Box>
  );
};
