import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Timeline,
  Chat as ChatIcon,
  EmojiEvents,
  Favorite,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const quickStats = [
    {
      title: 'Active Goals',
      value: '5',
      progress: 60,
      icon: <EmojiEvents />,
      route: '/goals',
    },
    {
      title: 'Wellness Score',
      value: '85%',
      progress: 85,
      icon: <Favorite />,
      route: '/wellness',
    },
    {
      title: 'Chat Sessions',
      value: '12',
      progress: 100,
      icon: <ChatIcon />,
      route: '/chat',
    },
    {
      title: 'Financial Health',
      value: 'Good',
      progress: 75,
      icon: <TrendingUp />,
      route: '/finance',
    },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.fullName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's your progress overview
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(stat.route)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: 'primary.light',
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stat.progress}
                  sx={{ mb: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Timeline>
                {/* Add timeline items here */}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<ChatIcon />}
                  onClick={() => navigate('/chat')}
                >
                  Start Chat Session
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmojiEvents />}
                  onClick={() => navigate('/goals')}
                >
                  Set New Goal
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Favorite />}
                  onClick={() => navigate('/wellness')}
                >
                  Log Wellness Activity
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
