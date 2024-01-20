const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
console.log(canvas)


//canvas settings
ctx.strokeStyle = 'white'
ctx.lineWidth = 0.7

class Particle {
    constructor(effect) {
        this.effect = effect
        this.x = Math.floor(Math.random() * this.effect.width)
        this.y = Math.floor(Math.random() * this.effect.height)
        this.speedX
        this.speedY
        this.speedModifier = Math.floor(Math.random() * 5 + 1)
        this.history = [{x: this.x, y: this.y}]
        this.maxLength = Math.floor(Math.random() * 60 + 20)
        this.angle = 0
        this.newAngle = 0
        this.angleCorrector = 0.5
        this.timer = this.maxLength * 2
        this.colors = ['#4d026e', '#8c1eff', '#b300ff', '#e600ff', '#ff00dd', '#ff00a8', '#ff0073', '#ff002e', '#ff0000']
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)]
    }
    draw(context){
        context.beginPath()
        context.moveTo(this.history[0].x, this.history[0].y)
        for(let i = 1; i < this.history.length; i++){
            context.lineTo(this.history[i].x, this.history[i].y)
        }
        context.strokeStyle = this.color
        context.stroke()
    }
    update(){
        this.timer--
        if(this.timer >= 1){
            let x = Math.floor(this.x / this.effect.cellsize)
            let y = Math.floor(this.y / this.effect.cellsize)
            let index = y * this.effect.cols + x
            if(this.effect.flowField[index]){
                this.newAngle = this.effect.flowField[index].colorAngle
                if(this.angle > this.newAngle){
                    this.angle -= this.angleCorrector
                } else if(this.angle < this.newAngle){
                    this.angle += this.angleCorrector
                } else {
                    this.angle = this.newAngle
                }
            }
            this.speedX = Math.cos(this.angle)
            this.speedY = Math.sin(this.angle)
            this.x += this.speedX * this.speedModifier
            this.y += this.speedY * this.speedModifier
            this.history.push({x: this.x, y: this.y})
            if(this.history.length > this.maxLength){
                this.history.shift()
            }
        } else if(this.history.length > 2){
            this.history.shift()
        } else {
            this.reset()
        }
        
    }
    reset(){
        let attemps = 0
        let resetSuccess = false
        while(attemps < 10 && !resetSuccess){
            attemps++
            let testIndex = Math.floor(Math.random() * this.effect.flowField.length)
            if(this.effect.flowField[testIndex].alpha > 0){
                this.x = this.effect.flowField[testIndex].x
                this.y = this.effect.flowField[testIndex].y
                this.history = [{x: this.x, y: this.y}]
                this.timer = this.maxLength * 2
                resetSuccess = true
            }
        }
        if(!resetSuccess){
            this.x = Math.floor(Math.random() * this.effect.width)
            this.y = Math.floor(Math.random() * this.effect.height)
            this.history = [{x: this.x, y: this.y}]
            this.timer = this.maxLength * 2
        }
    }
}

class Effect {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.context = ctx
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.particles = []
        this.numberOfParticles = 5000
        this.cellsize = 1
        this.rows
        this.cols
        this.flowField = []
        this.curve = 1.5
        this.zoom = 0.1
        this.debug = false
        this.init()
        window.addEventListener('keydown', e => {
            if(e.key === 'd'){
                this.debug = !this.debug
            }
        })
        window.addEventListener('resize', e => {
            console.log(this.canvas)
            this.resize(e.target.innerWidth, e.target.innerHeight)
        })
    }
    drawText(){
        this.context.font = '500px Impact'
        this.context.textAlign = 'center'
        this.context.textBaseline = 'middle'
        const gradient = this.context.createLinearGradient(0, 0, this.width, this.height)
        gradient.addColorStop(0.2, 'white')
        gradient.addColorStop(0.4, 'yellow')
        gradient.addColorStop(0.6, 'cyan')
        gradient.addColorStop(0.8, 'blue')
        ctx.fillStyle = gradient
        this.context.fillText('FLOW', this.width * 0.5, this.height * 0.5, this.width * 0.8)
    }
    init() {
        //create flow field
        this.rows = Math.floor(this.height / this.cellsize)
        this.cols = Math.floor(this.width / this.cellsize)
        this.flowField = []
        //draw text
        this.drawText()
        //scan pixel data
        const pixels = this.context.getImageData(0, 0, this.width, this.height).data
        for(let y = 0; y < this.height; y += this.cellsize){
            for(let x = 0; x < this.width; x += this.cellsize){
                const index = (x + y * this.width) * 4
                const red = pixels[index]
                const green = pixels[index + 1]
                const blue = pixels[index + 2]
                const alpha = pixels[index + 3]
                const grayscale = (red + green + blue) / 3
                const colorAngle = ((grayscale / 255) * Math.PI * 2).toFixed(2)
                this.flowField.push({
                    x: x,
                    y: y,
                    alpha: alpha,
                    colorAngle: colorAngle
                })
            }
        }
        
        /*for(let y = 0; y < this.rows; y++){
            for(let x = 0; x < this.cols; x++){
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve
                this.flowField.push(angle)
            }
        }*/

        //create particles
        this.particles = []
        for(let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this))
        }
        this.particles.forEach(particle => particle.reset())
    }
    drawGrid(){
        this.context.save()
        this.context.strokeStyle = 'gray'
        this.context.lineWidth = 0.2
        for(let c = 0; c < this.cols; c++){
            this.context.beginPath()
            this.context.moveTo(c * this.cellsize, 0)
            this.context.lineTo(c * this.cellsize, this.height)
            this.context.stroke()
        }
        for(let r = 0; r < this.rows; r++){
            this.context.beginPath()
            this.context.moveTo(0, r * this.cellsize)
            this.context.lineTo(this.width, r * this.cellsize)
            this.context.stroke()
        }
        this.context.restore()
    }
    resize(width, height){
        this.canvas.width = width
        this.canvas.height = height
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.init()
    }
    render(){
        if (this.debug) {
            this.drawGrid()
            this.drawText()
        }
        this.particles.forEach(particle => {
            particle.draw(this.context)
            particle.update()
        })
    }
}

const effect = new Effect(canvas, ctx)
effect.render(ctx)

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    effect.render()
    requestAnimationFrame(animate)
}
animate()