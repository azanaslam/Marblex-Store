const errorHandler = (error, _, res, __) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
};

module.exports = { errorHandler };
