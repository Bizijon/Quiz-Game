const express = require('express');
const router = express.Router();
const quiz = require('../data/quiz');
const prisma = require('../lib/prisma.js')
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");

function formatQuiz(LOLQuiz) {
  return {
    ...LOLQuiz,
    keywords: LOLQuiz.keywords.map((k) => k.name),
    userName: LOLQuiz.user ? LOLQuiz.user.name : null,
    user: undefined,
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
        include:{keywords: true},
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
  });

    if(!LOLQuiz){
        res.status(404).json({msg: "Can't find post lil bro"})
    }

    res.json(formatQuiz);
})

router.post("/", async (req,res)=>{
    const {question,answer,keywords} = req.body;
    if(!question || !answer || !keywords ){
        return res.status(400).json({msg: "ALL BODY PARTS REQUIRED >:)"})
    }

    const keywordsArray = Array.isArray(keywords) ? keywords : [];

    const existingIds = quiz.map(q=>q.id); 
    const maximumId = Math.max(...existingIds);

    const newQuiz = await prisma.quiz.create({
    data: {
      question, answer,
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
router.put("/:quizId", isOwner, async (req,res) =>{

const quizId = Number(req.params.quizId);
const {question,answer,keywords} = req.body;

const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

if(!LOLQuiz){
    res.status(404).json({msg: "Can't find post lil bro"})
    }

    if(!question || !answer || !keywords ){
        return res.status(400).json({msg: "ALL BODY PARTS REQUIRED >:)"})
    }
    const keywordsArray = Array.isArray(keywords) ? keywords : [];
    const updatedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      question, answer,
      keywords: {
        set: [],
        connectOrCreate: keywordsArray.map((kw) => ({
          where: { name: kw },
          create: { name: kw },
        })),
      },
    },
    include: { keywords: true, user: true },
  });
  res.json(formatQuiz(updatedQuiz));

});

//DELETE /api/quiz/:quizId

router.delete("/:quizId",isOwner, async (req, res) =>{
    const quizId = Number(req.params.quizId);
    const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { keywords: true , user: true},
  });


    if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }


    await prisma.quiz.delete({ where: { id: quizId } });

    res.json({
        msg:"Quiz deleted successfully",
        LolQuiz : formatQuiz})
})

module.exports = router;