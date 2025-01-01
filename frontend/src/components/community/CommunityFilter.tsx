import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search, TrendingUp } from '@mui/icons-material';

const categories = [
  'All',
  'General Discussion',
  'Mental Health',
  'Physical Health',
  'Relationships',
  'Career Growth',
  'Personal Development',
  'Parenting',
  'Financial Wellness',
  'Success Stories',
  'Support Request',
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'discussed', label: 'Most Discussed' },
];

interface Props {
  selectedCategory: string;
  sortBy: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
}

const CommunityFilter: React.FC<Props> = ({
  selectedCategory,
  sortBy,
  searchQuery,
  onCategoryChange,
  onSortChange,
  onSearchChange,
}) => {
  const trendingTopics = [
    'Mental Health',
    'Work-Life Balance',
    'Meditation',
    'Personal Growth',
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => onSortChange(e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Categories
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => onCategoryChange(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrendingUp fontSize="small" />
            Trending Topics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {trendingTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="small"
                onClick={() => onSearchChange(topic)}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CommunityFilter;
