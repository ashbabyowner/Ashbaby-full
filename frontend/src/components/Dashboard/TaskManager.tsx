import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Badge,
  Checkbox,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Progress,
  useColorModeValue,
  DragHandleIcon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoAddOutline,
  IoAlarmOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoEllipsisVerticalOutline,
  IoFlagOutline,
  IoListOutline,
  IoPersonOutline,
  IoStarOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { useTasks } from '../../hooks/useTasks';

interface TaskManagerProps {
  compact?: boolean;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const {
    tasks,
    projects,
    stats,
    addTask,
    updateTask,
    deleteTask,
    getTaskInsights,
    isLoading,
  } = useTasks();

  const MotionBox = motion(Box);

  const TaskCard = ({
    task,
    showActions = true,
  }: {
    task: any;
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
        <HStack>
          <Checkbox
            isChecked={task.completed}
            onChange={() => updateTask(task.id, { completed: !task.completed })}
          />
          <Text
            flex="1"
            textDecoration={task.completed ? 'line-through' : 'none'}
            color={task.completed ? 'gray.500' : 'inherit'}
          >
            {task.title}
          </Text>
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
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </MenuItem>
                <MenuItem
                  icon={<IoStarOutline />}
                  onClick={() => updateTask(task.id, { priority: 'high' })}
                >
                  Set Priority
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        {task.description && (
          <Text fontSize="sm" color="gray.500">
            {task.description}
          </Text>
        )}

        <HStack spacing={2} flexWrap="wrap">
          {task.priority && (
            <Badge
              colorScheme={
                task.priority === 'high'
                  ? 'red'
                  : task.priority === 'medium'
                  ? 'orange'
                  : 'green'
              }
            >
              {task.priority}
            </Badge>
          )}
          {task.project && (
            <Badge colorScheme="purple">
              {task.project}
            </Badge>
          )}
          {task.tags.map((tag: string) => (
            <Badge key={tag} colorScheme="blue" variant="subtle">
              {tag}
            </Badge>
          ))}
        </HStack>

        <HStack justify="space-between" fontSize="sm" color="gray.500">
          {task.dueDate && (
            <HStack>
              <Icon as={IoCalendarOutline} />
              <Text>
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </HStack>
          )}
          {task.assignee && (
            <HStack>
              <Icon as={IoPersonOutline} />
              <Text>{task.assignee}</Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </MotionBox>
  );

  const ProjectCard = ({ project }: { project: any }) => (
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
              as={IoListOutline}
              color={`${project.color}.500`}
              boxSize={5}
            />
            <Text fontWeight="medium">{project.name}</Text>
          </HStack>
          <Badge colorScheme={project.color}>
            {project.tasks.length} tasks
          </Badge>
        </HStack>

        <Progress
          value={(project.completed / project.total) * 100}
          colorScheme={project.color}
          size="sm"
          borderRadius="full"
        />

        <HStack justify="space-between" fontSize="sm">
          <Text color="gray.500">
            {project.completed}/{project.total} completed
          </Text>
          {project.dueDate && (
            <HStack>
              <Icon as={IoCalendarOutline} />
              <Text>
                {new Date(project.dueDate).toLocaleDateString()}
              </Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </MotionBox>
  );

  const QuickAddTask = () => (
    <HStack spacing={4}>
      <Input placeholder="Add a new task..." />
      <IconButton
        aria-label="Add task"
        icon={<IoAddOutline />}
        colorScheme="blue"
        onClick={() => addTask()}
      />
    </HStack>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Tasks
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addTask()}
          >
            Add Task
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {tasks.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} showActions={false} />
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
            Task Manager
          </Text>
          <HStack>
            <Button
              leftIcon={<IoCheckmarkCircleOutline />}
              variant="outline"
              onClick={() => getTaskInsights()}
            >
              Insights
            </Button>
            <Button
              leftIcon={<IoAddOutline />}
              colorScheme="blue"
              onClick={() => addTask()}
            >
              New Task
            </Button>
          </HStack>
        </HStack>

        {/* Quick Add Task */}
        <QuickAddTask />

        {/* Projects Overview */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Projects
          </Text>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={4}
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Grid>
        </Box>

        {/* Task Lists */}
        <Grid
          templateColumns={{
            base: '1fr',
            lg: 'repeat(2, 1fr)',
          }}
          gap={6}
        >
          {/* Today's Tasks */}
          <Box>
            <HStack mb={4} justify="space-between">
              <Text fontSize="xl" fontWeight="bold">
                Today's Tasks
              </Text>
              <Badge colorScheme="green">
                {tasks.filter((t) => t.completed).length}/
                {tasks.length}
              </Badge>
            </HStack>
            <VStack align="stretch" spacing={4}>
              {tasks
                .filter((task) => task.dueDate === new Date().toISOString().split('T')[0])
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </VStack>
          </Box>

          {/* Upcoming Tasks */}
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Upcoming Tasks
            </Text>
            <VStack align="stretch" spacing={4}>
              {tasks
                .filter((task) => new Date(task.dueDate) > new Date())
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </VStack>
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
};
