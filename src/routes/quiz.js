const express = require('express');
const router = express.Router();
const quiz = require('../data/quiz');
const prisma = require('../lib/prisma.js')
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");
const multer = require("multer");
const path = require("path");
const {NotFoundError, ValidationError} = require("../lib/errors")
const {z} = require("zod");

const QuizInput = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  keywords:z.union([z.string(),z.array(z.string())]).optional()
})
const storage = multer.diskStorage({
  destination: path.join(__dirname,"..","..","public","uploads"),
  filename:(req,res,cb)=>{
    const ext = path.extName(file.originalname);
    const newName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null,newName);
  }

});

const upload = multer({
       storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
    })

function formatQuiz(LOLQuiz) {
  return {
    ...LOLQuiz,
    keywords: LOLQuiz.keywords.map((k) => k.name),
    userName: LOLQuiz.user ? LOLQuiz.user.name : null,
    attempts: LOLQuiz.attempts && LOLQuiz.attempts.length > 0,
    attemptCount: LOLQuiz._count.attempts ?? 0,
    user: undefined,
    _count: undefined,
    attempts: undefined,
  };
}

router.use(authenticate);
 

// GET /api/quiz or /api/quiz?keyword=ability&page=1&\limit=5
router.get("/", async (req,res) =>{
    const {keyword} = req.query;

    const where = keyword ? 
    {keywords : {some: {name: keyword}}} : {};

    const page = Math.max(1,parseInt(req.query.page) || 1);
    const limit = Math.min(1,Math.min(100,parseInt(req.query.limit) || 5));
    const skip = (page -1) * limit;

    const [filteredQuiz, total] = await Promise.all([prisma.LOLQuiz.findMany({
        where,
        include:{
          keywords: true,
          user: true,
          attempts: {where : {userId: req.user.userId}},
          _count: {select: {attempts: true}}

          },

        orderBy: {id : "asc"},
        skip,
        take: limit
    }), await prisma.LOLQuiz.count({where})]);
    res.json({
      data: filteredQuiz.map(formatQuiz),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })


})

//GET /api/quiz/:quizid

router.get("/:quizId", async (req,res)=>{
    const quizId = Number(req.params.quizId);
    const LOLQuiz = await prisma.LOLQuiz.findUnique({
    where: { id: LOLQuizId },
    include: { keywords: true, user: true},
    attempts: {where : {userId: req.user.userId}},
    _count: {select: {attempts: true}}
  });

    if(!LOLQuiz){
        throw new NotFoundError("Post not found");
    }

    res.json(formatQuiz);
})

router.post("/", upload.single("image"), async (req,res)=>{
    
  
    const {question,answer,keywords} = QuizInput.parse(req.body);
    

    const keywordsArray = Array.isArray(keywords) ? keywords : [];

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const existingIds = quiz.map(q=>q.id); 
    const maximumId = Math.max(...existingIds);

    const newQuiz = await prisma.quiz.create({
    data: {
      question, answer, imageUrl,
      userId: req.user.userId,
      keywords: {
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw }, create: { name: kw },
        })), },
    },
    include: { keywords: true },
  });


    res.status(201).json(formatQuiz);
});

//PUT /api/quiz/:quizId
router.put("/:quizId", isOwner,upload.single("image"), async (req,res) =>{

const quizId = Number(req.params.quizId);
const {question,answer,keywords} = QuizInput.parse(req.body);

const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

if(!LOLQuiz){
    throw new NotFoundError("Post not found");
    }

    if(!question || !answer || !keywords ){
       throw new ValidationError("ALL BODY PARTS REQUIRED")
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const keywordsArray = Array.isArray(keywords) ? keywords : [];
    const updatedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      question, answer,imageUrl,
      keywords: {
        set: [],
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw },
          create: { name: kw },
        })),
      },
    },
    include: { keywords: true,
       user: true,
      attempts:{where: {userId: req.user.userId}, take: 1},
    _count:{select: {attempts: true}} 
  },
  });
  res.json(formatQuiz(updatedQuiz));

});

//DELETE /api/quiz/:quizId

router.delete("/:quizId",isOwner, async (req, res) =>{
    const quizId = Number(req.params.quizId);
    const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { keywords: true ,
       user: true,
      attempts:{where: {userId: req.user.userId}, take: 1},
    _count:{select: {attempts: true}}},
  });


    if (!quiz) {
    throw new NotFoundError("Quiz not found.");
  }


    await prisma.quiz.delete({ where: { id: quizId } });

    res.json({
        msg:"Quiz deleted successfully",
        LolQuiz : formatQuiz})
})

//Post /api/:quizId/attempt
router.post("/:quizId/attempts", async (req, res) => {
  const quizId = Number(req.params.quizId);
  const LolQuiz = await prisma.LOLQuiz.findUnique({where: {id : quizId}})

  if(!LolQuiz){
    throw new NotFoundError("Quiz not found.");
  }

  const attempt = await prisma.attempt.upsert({
    where : {userId_quizId:{userId: req.user.userId, quizId}},
    update : {},
    create : {userId: req.user.userId, quizId},
  });

  const attemptCount = await prisma.attempt.count({
    where: {quizId},
  })

  res.status(201).json({
    id:attempt.id,
    quizId,
    attempted: true,
    attemptCount,
    createdAt: attempt.createdAt,
  })

})

//Delete /api/:quizId/attempt
router.delete("/:quizId/attempts", async (req, res) => {
  const quizId = Number(req.params.quizId);
  const LolQuiz = await prisma.LOLQuiz.findUnique({where: {id : quizId}})

  if(!LolQuiz){
   throw new NotFoundError("Quiz not found.");
  }

  const attempt = await prisma.attempt.deleteMany({
    where : {userId: req.user.userId, quizId},
  });

  const attemptCount = await prisma.attempt.count({
    where: {quizId},
  })

  res.json({
    quizId,
    attempted: false,
    attemptCount,
  })

})

module.exports = router;