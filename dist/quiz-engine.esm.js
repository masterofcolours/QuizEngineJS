class QuizEngine {

    /**
     * @typedef {Object} QuizTimeConfig
     * @property {number} [hours=0] - Duration in hours.
     * @property {number} [minutes=0] - Duration in minutes.
     * @property {number} [seconds=0] - Duration in seconds.
     */

    /**
     * @typedef {Object} QuestionOption
     * @property {string|number} value - The actual option value/identifier.
     * @property {string} text - The display label for the option.
     */

    /**
     * @typedef {Object} Question
     * @property {string|number} id - Unique identifier for the question.
     * @property {string} prompt - The question text or prompt.
     * @property {QuestionOption[]} options - List of choices for the question.
     * @property {string|number} answer - The correct option value or key.
     */

    /**
     * @typedef {Object} QuizContainer
     * @property {string|HTMLElement} [nextButton] - Selector or element for navigating to the next question.
     * @property {string|HTMLElement} [previousButton] - Selector or element for navigating to the previous question.
     * @property {string|HTMLElement} [promptBox] - Selector or element to display the question prompt.
     * @property {string|HTMLElement} [indexBox] - Selector or element to display the question progress/index.
     * @property {string|HTMLElement} [selectButton] - Selector or element to submit/confirm answer selection.
     * @property {string|HTMLElement} [endButton] - Selector or element to terminate and submit the quiz.
     * @property {string|HTMLElement} [timerBox] - Selector or element to display remaining time.
     * @property {string} optionsContainer - CSS selector for option input elements (e.g., radio buttons).
     * @property {string} labels - CSS selector for option text label elements.
     */

   /**
     * @typedef {Object} QuizOptions
     * @property {QuizTimeConfig} [time] - Optional timer configuration object.
     * @property {boolean} [lockstepMode=false] - If true, users must answer the current question before moving to the next question.
     * @property {boolean} [noBacktracking=false] - If true, users cannot return to previous questions.
     * @property {boolean} [shuffle=false] - If true, questions are shuffled before the quiz starts.
     */

    constructor(questions = [], container = {}, options = {}) {

        if(questions.length === 0){
            throw new Error("QuizEngine: 'questions' array cannot be empty.");
        }
        
        if(options.time === undefined){
            console.warn("QuizEngine: 'options.time' is not defined.");
        }

        if(options.time){
            this.time = options.time;
            this.totalTime = null;
        }

        this.currentTime = 0;
        this.lockstepMode = options.lockstepMode;
        this.noBacktracking = options.noBacktracking;
        this.shuffle = options.shuffle;

        this.questions = questions;

        if(this.shuffle){
            this.shuffleQuestions();
        }

        this.userAnswers = [];
        this.currentAnswer = "";
        this.currentIndex = 0;
        this.currentQuestion = this.questions[0];
        this.currentId = this.questions[0].id;
        this.currentPrompt = this.questions[0].prompt;

        this.interval = null;
        this.isEnded = false;

        this.nextButton = typeof container.nextButton === 'string' 
        ? document.querySelector(container.nextButton)
        : container.nextButton;

        this.previousButton = typeof container.previousButton === 'string' 
        ? document.querySelector(container.previousButton)
        : container.previousButton;

        this.promptBox = typeof container.promptBox === "string"
        ? document.querySelector(container.promptBox)
        : container.promptBox;

        this.indexBox = typeof container.indexBox === "string" 
        ? document.querySelector(container.indexBox) 
        : container.indexBox;
        
        this.selectButton = typeof container.selectButton === "string" 
        ? document.querySelector(container.selectButton) 
        : container.selectButton;
        
        this.endButton = typeof container.endButton === "string" 
        ? document.querySelector(container.endButton) 
        : container.endButton;
        
        this.timerBox = typeof container.timerBox === "string" 
        ? document.querySelector(container.timerBox) 
        : container.timerBox;

        if(container.optionsContainer){
            this.optionsContainer = typeof container.optionsContainer === "string" 
            ? document.querySelectorAll(container.optionsContainer)
            : container.optionsContainer;
        }
        
        if(container.labels){
            this.labels = typeof container.labels === "string" 
            ? document.querySelectorAll(container.labels)
            : container.labels;
        }

        if(this.labels && this.optionsContainer){
            this.setHandelers();
        }else {
            throw new Error("You have not defined container.optionsContainer or container.labels");
        }
        

        if(this.time && this.timerBox){
            this.setTime();
        }

        if(this.questions.length > 0 && this.labels){
            this.initialRender();
        }else {
            throw new Error("You have not defined container.labels");
        }
        
    }
    
    setHandelers(){
        if(this.optionsContainer){
            for(let radioBTN of this.optionsContainer){
                if(radioBTN){
                    radioBTN.addEventListener("change", (event)=>{
                      this.currentAnswer = event.target.value;
                    });
                }else {
                    console.warn("You have not selected one or more of the radioBTN!");
                }
            }
        }

        if(this.selectButton){
            this.selectButton.addEventListener("click", ()=>{
                this.selectAnswer();
            });
        }else {
            console.warn("You have not selected the selectButton!");
        }

        if(this.nextButton){
            this.nextButton.addEventListener("click", ()=>{
                this.move("next");
            });
        }else {
            console.warn("You have not selected the nextButton!");
        }
        
        if(this.previousButton){
            this.previousButton.addEventListener("click", ()=>{
                this.move("previous");
            });
        }else {
            console.warn("You have not selected the previousButton!");
        }
        
        if(this.endButton){
            this.endButton.addEventListener("click", ()=>{
                this.endQuiz();
            });
        }else {
            console.warn("You have not selected the endButton!");
        }
    }

    selectAnswer(){
        if(!this.isEnded){
            const itExist = this.userAnswers.find((item)=>{
                return this.currentId === item[2] ? true : false;
            });
    
            if(!itExist){
    
                if(this.currentAnswer){
                    this.userAnswers.push([this.currentAnswer, this.currentIndex + 1, this.currentId]);
                }else {
                    this.userAnswers.push([undefined, this.currentIndex + 1, this.currentId]);
                    
                }
                
            }else {
                alert("This question has already been answered!");
            }

        }else {
            alert("The Quiz has ended. You cannot submit another answer.");
        }
    }
    
    removeAnswer(){
        const index = this.userAnswers.findIndex((item)=>{
            return item[2] === this.currentId;
        });
        
        if(index !== -1){
            this.userAnswers.splice(index, 1);
        }

        this.currentAnswer = "";
    }
    
    move(type){
        if(type === "next"){
            if(this.lockstepMode){
                const itExist = this.userAnswers.find((item)=>{
                    return this.currentId === item[2] ? true : false;
                });
        
                if(!itExist){
                    alert("You must answer this question to see the next one!");
                    return;
                }
            }
        }

        if(type === "previous"){
            if(this.noBacktracking){
                alert("It is not possible to return to the previous question!");
                return;
            }
        }
        
        if(type === "previous"){

            if(this.currentIndex -1 < 0){
                return;
            }else {
                this.currentIndex -= 1;
            }
        }
        
        if(type === "next"){
            if(this.currentIndex+1 >= this.questions.length){
                alert("There are no further questions. You may exit the quiz.");
                return;
            }else {
                this.currentIndex += 1;
            }

        }


        this.currentAnswer = "";
        
        this.currentQuestion = this.questions[this.currentIndex];
        
        this.currentId = this.currentQuestion.id;
        
        this.currentPrompt = this.currentQuestion.prompt;

        this.promptBox.textContent = this.currentPrompt;

        if(this.labels){
            this.labels.forEach((item, index)=>{
                if(this.currentQuestion.options[index]){
                    item.textContent = this.currentQuestion.options[index].text;
                }
            });
        }

        if(type === "previous"){
            this.setChekedProp();
        }
        
        if(type === "next"){
            this.setChekedProp();
        }

        if(this.indexBox){
            this.indexBox.textContent = (this.currentIndex + 1) + "-" + this.questions.length;
        }

    }


    
    
    setTime() {
        if(!this.interval){
            const inputSeconds = this.time.seconds ? this.time.seconds : 0;
            const inputMinutes = this.time.minutes ? this.time.minutes : 0;
            const inputHours = this.time.hours ? this.time.hours : 0;
    
            this.totalTime = inputSeconds + (inputMinutes * 60) + (inputHours * 3600);
            this.currentTime = this.totalTime;
            
            this.interval = setInterval(() => {
                this.currentTime -= 1;
    
                const hours = Math.floor(this.currentTime / 3600);
                const minutes = Math.floor((this.currentTime % 3600) / 60);
                const seconds = this.currentTime % 60;
                
                const formatNum = (num) => String(num).padStart(2, '0');
                if(this.timerBox){
                    this.timerBox.textContent = `${formatNum(hours)}:${formatNum(minutes)}:${formatNum(seconds)}`;
                }
                
                if (this.currentTime <= 0) {
                    this.stopTimer();
                    this.endQuiz();
                    alert("Your time is up!");
                }
            }, 1000);
        }
    }
    
    stopTimer(){
        clearInterval(this.interval);
        this.interval = null;
    }

    shuffleQuestions(){
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }
    
    initialRender(){
        this.promptBox.textContent = this.currentQuestion.prompt;

        if(this.labels){
            this.labels.forEach((item, index)=>{
                if (this.currentQuestion.options[index]) {
                    item.textContent = this.currentQuestion.options[index].text;
                }
            });
        }

        if(this.indexBox){
            this.indexBox.textContent = (this.currentIndex + 1) + "-" + this.questions.length;
        }
    }

    setChekedProp(){
        const result = this.userAnswers.find((item)=>{
            if(item[2] === this.currentId && item[0] !== undefined){
                return item;
            }
        });
        
        if(result && this.optionsContainer){
            this.optionsContainer.forEach((innerItem)=>{
                if(innerItem.value === result[0]){
                    innerItem.checked = true;
                }
            });
        }else {
            if(this.optionsContainer){
                this.optionsContainer.forEach((item)=>{
                    item.checked = false;
                });
            }
        }
    }

    receiveResult(eventName, data = {}){
        this.myEvent = new CustomEvent(eventName);
        return this.myEvent;
        
    }
    

    endQuiz() {
        if(!this.isEnded){
            this.userAnswers = this.questions.map((question, index) => {
                const foundAnswer = this.userAnswers.find(ans => ans[2] === question.id);
                if (foundAnswer) {
                    return foundAnswer;
                } else {
                    return [undefined, index + 1, question.id];
                }
            });
    
            if(this.interval){
                this.stopTimer();
            }
    
            this.isEnded = true;

            if(this.myEvent){
                document.dispatchEvent(this.myEvent);
            }
        }
    }
    
    result(){
        let resultArray = [];
        this.questions.forEach((item, index)=>{
            if(this.userAnswers[index][0] === item.answer){
                resultArray.push([index, item.answer, true]);
            }else {
                resultArray.push([index, item.answer, false]);
            }
        });
        
        return resultArray;
    }
}

export { QuizEngine, QuizEngine as default };
//# sourceMappingURL=quiz-engine.esm.js.map
