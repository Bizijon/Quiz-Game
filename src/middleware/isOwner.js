const { NotFoundError, ForbiddenError } = require("../lib/errors");
const prisma = require("../lib/prisma");

async function isOwner (req, res, next) {
    const id = Number(req.params.LOLQuizId);
    const LOLQuiz = await prisma.LOLQuiz.findUnique({
      where: { id },
      include: { keywords: true },
    });

    if (!LOLQuiz) {
      throw new NotFoundError("Quiz not found")
    }

    if (LOLQuiz.userId !== req.user.userId) {
      throw new ForbiddenError("You can only modify your own questions.")
    }

    // Attach the record to the request so the route handler can reuse it
    req.LOLQuiz = LOLQuiz;
    next();
  
}

module.exports = isOwner;