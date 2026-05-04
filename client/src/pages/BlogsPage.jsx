import { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { http } from "../api/http";

export const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    http.get("/blogs").then((res) => setBlogs(res.data));
  }, []);

  return (
    <>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Blog & Updates
      </Typography>
      {blogs.map((blog) => (
        <Card key={blog._id} sx={{ mb: 2, borderRadius: 3 }}>
          <CardMedia component="img" height="220" image={blog.coverImage} alt={blog.title} />
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              {blog.title}
            </Typography>
            <Typography color="text.secondary">{blog.content}</Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
