const express = require('express');
const router = express.Router();
const quiz = require('../data/quiz');

// GET /api/quiz or /api/quiz?keyword=ability
router.get("/", (req,res) =>{
    const {keyword} = req.query;
    if(!keyword){
    return res.json(quiz);
}
    const filteredQuiz = quiz.filter(q=>q.keywords.includes(keyword));
    res.json(filteredQuiz);


})

//GET /api/quiz/:quizid

router.get("/:quizId", (req,res)=>{
    const quizId = Number(req.params.quizId);
    const LOLQuiz = quiz.find(q=>q.id === quizId)
    if(!LOLQuiz){
        res.status(404).json({msg: "Can't find post lil bro"})
    }

    res.json(LOLQuiz);
})

router.post("/", (req,res)=>{
    const {question,answer,keywords} = req.body;
    if(!question || !answer || !keywords ){
        return res.status(400).json({msg: "ALL BODY PARTS REQUIRED >:)"})
    }

    const existingIds = quiz.map(q=>q.id); 
    const maximumId = Math.max(...existingIds);

    const newQuestion = {
        id: quiz.length ? maximumId + 1 : 1, 
        question, answer,
        keywords: Array.isArray(keywords) ? keywords : []
    }

    quiz.push(newQuestion);

    res.status(201).json(newQuestion);
});

//PUT /api/quiz/:quizId
router.put("/:quizId", (req,res) =>{

const quizId = Number(req.params.quizId);
    const LOLQuiz = quiz.find(q=>q.id === quizId)
    if(!LOLQuiz){
        res.status(404).json({msg: "Can't find post lil bro"})
    }

    const {question,answer,keywords} = req.body;
    if(!question || !answer || !keywords ){
        return res.status(400).json({msg: "ALL BODY PARTS REQUIRED >:)"})
    }

    LOLQuiz.question = question;
    LOLQuiz.answer = answer;
    LOLQuiz.keywords = Array.isArray(keywords) ? keywords : [];

    res.json(LOLQuiz);

});

//DELETE /api/quiz/:quizId

router.delete("/:quizId", (req, res) =>{
    const quizId = Number(req.params.quizId);
    const LolQuizIndex = quiz.findIndex(q=>q.id === q.id);

    if(LolQuizIndex === -1){
        return res.status(404).json({msg:"Cant find post >:("})
    }

    const deletedLolQuiz = quiz.splice(LolQuizIndex,1);

    res.json({
        msg:"Post deleted successfully",
        LolQuiz : deletedLolQuiz})
})

module.exports = router;