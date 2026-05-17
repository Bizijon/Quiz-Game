const prisma = require("../lib/prisma");

async function isOwner (req, res, next) {
    const id = Number(req.params.LOLQuizId);
    const LOLQuiz = await prisma.LOLQuiz.findUnique({
      where: { id },
      include: { keywords: true },
    });

    if (!LOLQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (LOLQuiz.userId !== req.user.userId) {
      return res.status(403).json({ error: "You can only modify your own posts" });
    }

    // Attach the record to the request so the route handler can reuse it
    req.LOLQuiz = LOLQuiz;
    next();
  
}

module.exports = isOwner;