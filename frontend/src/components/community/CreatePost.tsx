import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const categories = [
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

const validationSchema = yup.object({
  content: yup
    .string()
    .required('Content is required')
    .min(10, 'Post must be at least 10 characters')
    .max(2000, 'Post cannot exceed 2000 characters'),
  category: yup.string().required('Category is required'),
});

interface Props {
  onSubmit: (values: {
    content: string;
    category: string;
    isAnonymous: boolean;
  }) => void;
}

const CreatePost: React.FC<Props> = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const formik = useFormik({
    initialValues: {
      content: '',
      category: '',
      isAnonymous: false,
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      onSubmit(values);
      resetForm();
      setOpen(false);
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const communityGuidelines = [
    'Be respectful and supportive of others',
    'No hate speech or bullying',
    'Protect your privacy and others\' privacy',
    'Stay on topic within each category',
    'Provide constructive feedback',
    'Report inappropriate content',
  ];

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Share your thoughts with the community..."
              onClick={handleOpen}
              sx={{ cursor: 'pointer' }}
              InputProps={{
                readOnly: true,
              }}
            />
            <Button variant="contained" onClick={handleOpen}>
              Post
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create Post</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Share your experiences, ask for advice, or offer support to others.{' '}
              <Button
                size="small"
                onClick={() => setShowGuidelines(!showGuidelines)}
              >
                View Community Guidelines
              </Button>
            </Alert>

            {showGuidelines && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Community Guidelines
                </Typography>
                {communityGuidelines.map((guideline, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 0.5 }}
                  >
                    • {guideline}
                  </Typography>
                ))}
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="What's on your mind?"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
              error={formik.touched.content && Boolean(formik.errors.content)}
              helperText={formik.touched.content && formik.errors.content}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label="Category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
              sx={{ mb: 2 }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  name="isAnonymous"
                  checked={formik.values.isAnonymous}
                  onChange={formik.handleChange}
                />
              }
              label="Post anonymously"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!formik.isValid || !formik.dirty}
            >
              Post
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default CreatePost;
