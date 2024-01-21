const canvas = document.getElementById('canvas1'); // získání canvasu z HTML
const ctx = canvas.getContext('2d'); // získání kontextu canvasu
canvas.width = window.innerWidth // nastavení šířky canvasu na šířku okna
canvas.height = window.innerHeight // nastavení výšky canvasu na výšku okna


//canvas settings
ctx.lineWidth = Math.random() * 2 + 0.5 // nastavení náhodné šířky čáry od 0.5 do 2.5

class Particle {
    constructor(effect) {
        // Nastavení různých vlastností, například pozice, rychlost, barva, atd.
        this.effect = effect
        this.x = Math.floor(Math.random() * this.effect.width)
        this.y = Math.floor(Math.random() * this.effect.height)
        this.speedX
        this.speedY
        this.speedModifier = Math.floor(Math.random() * 5 + 1)
        this.history = [{x: this.x, y: this.y}]
        this.maxLength = Math.floor(Math.random() * 60 + 10)
        this.angle = 0
        this.newAngle = 0
        this.angleCorrector = 0.5
        this.timer = this.maxLength * 2
        //this.colors = ['#4d026e', '#8c1eff', '#b300ff', '#e600ff', '#ff00dd', '#ff00a8', '#ff0073', '#ff002e', '#ff0000']
        //this.color = this.colors[Math.floor(Math.random() * this.colors.length)]
        this.red = 0
        this.green = 0
        this.blue = 0
        this.color = `rgb(${this.red}, ${this.green}, ${this.blue})`
    }
    draw(context){
        //vykreslení jednotlivých částic
        context.beginPath()
        context.moveTo(this.history[0].x, this.history[0].y) //posunutí se na začátek čáry
        for(let i = 1; i < this.history.length; i++){
            context.lineTo(this.history[i].x, this.history[i].y) //vykreslení čáry od začátku do konce, podle počtu bodů v poli history
        }
        context.strokeStyle = this.color //nastavení barvy čáry
        context.stroke() //vykreslení čáry
    }
    update(){
        this.timer-- //zkrácení času, aby čáry nebyly nekonečné
        if(this.timer >= 1){
            let x = Math.floor(this.x / this.effect.cellsize) //zjistí souřadnici x v poli, pouze důležité pro obrazce, jelikož u textu a obrázku je cellsize = 1
            let y = Math.floor(this.y / this.effect.cellsize) 
            let index = y * this.effect.cols + x //zjistí index pole ve kterém je, tím že zjistí v jakém řádku a sloupci se nachází
            let flowFieldIndex = this.effect.flowField[index] //získá hodnotu(barvu a směr) pole na daném indexu
            if(flowFieldIndex){ //pokud je pole definované tak se provede následující
                this.newAngle = flowFieldIndex.colorAngle //získá směr z pole
                if(this.angle > this.newAngle){ //pokud je angle příliš větší než newAngle, tak se angle zmenší o angleCorrector, aby celá animace byla plynulejší
                    this.angle -= this.angleCorrector
                } else if(this.angle < this.newAngle){
                    this.angle += this.angleCorrector
                } else {
                    this.angle = this.newAngle
                }
                if(flowFieldIndex.alpha > 0){ //pokud je jakákoli barva v poli(alpha je větší než nula), tak se barva částice změní na barvu z pole
                    this.red === flowFieldIndex.red ? this.red : this.red += (flowFieldIndex.red - this.red) * 0.1 //pokud je barva částice stejná jako barva z pole, tak se nic neděje, pokud ne, tak se barva částice změní na barvu z pole, která je trochu zmenšena aby nedocházelo k velkým skokům barev, ale aby se barva měnila plynule
                    this.green === flowFieldIndex.green ? this.green : this.green += (flowFieldIndex.green - this.green) * 0.1
                    this.blue === flowFieldIndex.blue ? this.blue : this.blue += (flowFieldIndex.blue - this.blue) * 0.1
                    this.color = `rgb(${this.red}, ${this.green}, ${this.blue})` //všechny barvy se uloží do jedné proměnné color
                }
            }
            this.speedX = Math.cos(this.angle) //získá rychlost částice na ose x a y, díky tomu se čáry tak vlní, jinak by byly rovné
            this.speedY = Math.sin(this.angle)
            this.x += this.speedX * this.speedModifier //určí novou pozici částice pomocí speedX a speedY, a tu upraví pomocí speedModifieru, který určuje jak rychle se částice pohybuje
            this.y += this.speedY * this.speedModifier
            this.history.push({x: this.x, y: this.y}) //nová pozice se uloží do pole history
            if(this.history.length > this.maxLength){ //pokud je pole history delší než maxLength, tak se první pozice v poli smaže
                this.history.shift()
            }
        } else if(this.history.length > 2){ //pokud je pole history delší než 2 a čas vypršel, tak se postupně vymažou všechny pozice v poli history
            this.history.shift()
        } else { //pokud je pole history kratší než 2 a čas vypršel, tak se částice resetuje
            this.reset()
        }
        
    }
    reset(){ //resetování částice
        let attemps = 0 //nastaví počet pokusů na vygenerování částice na 0
        let resetSuccess = false //nastaví úspěšnost resetu na false
        while(attemps < 15 && !resetSuccess){ //pokud je počet pokusů menší než 15 a reset se nepovedl, tak se provede následující
            attemps++ //zvýší počet pokusů o 1
            let testIndex = Math.floor(Math.random() * this.effect.flowField.length) //vybere náhodný index z pole flowField
            if(this.effect.flowField[testIndex].alpha > 0){ //pokud je alpha na daném indexu větší než 0, tak se provede následující
                this.x = this.effect.flowField[testIndex].x //nastaví pozici částice na pozici z pole flowField
                this.y = this.effect.flowField[testIndex].y 
                this.history = [{x: this.x, y: this.y}] //do pole history vloží novou pozici
                this.timer = this.maxLength * 2 //nastaví čas na maxLength * 2
                resetSuccess = true //nastaví úspěšnost resetu na true
            }
        }
        if(!resetSuccess){ //pokud se reset nepovedl a proběhlo moc pokusů, tak se vygeneruje náhodná pozice pro částici
            this.x = Math.floor(Math.random() * this.effect.width)
            this.y = Math.floor(Math.random() * this.effect.height)
            this.history = [{x: this.x, y: this.y}]
            this.timer = this.maxLength * 2
        }
    }
}

class Effect { //třída pro efekt
    constructor(canvas, ctx) {
        this.canvas = canvas //získání canvasu
        this.context = ctx //získání kontextu canvasu
        this.width = this.canvas.width //získání šířky canvasu
        this.height = this.canvas.height //získání výšky canvasu
        this.particles = [] //pole pro částice
        this.numberOfParticles = 5000 //nastaví se počet částic
        this.cellsize = 1 //nastaví se velikost buněk, pro obrázek a text musí být cellsize = 1, nebo musí být obrazovka jím dělitelná, pro obrazce je to jedno
        this.rows //vytvoří se proměnná pro řádky a sloupce, které se nastaví v init()
        this.cols
        this.flowField = [] //pole pro flowField
        this.curve = 1.5 //nastaví se křivka, která určuje jak moc se čáry vlní, je užitečná pouze pro obrazce, jelikož u textu a obrázku je křivka závislá na barvě obrázku/textu
        this.zoom = 0.1 //to stejné platí pro zoom, který pouze přibližuje a oddaluje obrazec
        this.debug = false //nastaví debug mode na false, v tom se zobrazuje grid a text/obrázek
        this.image = document.getElementById('image') //získá obrázek z HTML
        this.init() //spustí se funkce init()
        window.addEventListener('keydown', e => { //při stisknutí klávesy d se přepne debug mode
            if(e.key === 'd'){
                this.debug = !this.debug
            }
        })
        window.addEventListener('resize', e => { //při změně velikosti okna se zavolá funkce resize()
            console.log(this.canvas)
            this.resize(e.target.innerWidth, e.target.innerHeight)
        })
    }
    drawText(){ //funkce pro vykreslení textu
        this.context.font = '500px Impact' //nastaví se font a velikost písma
        this.context.textAlign = 'center' //nastaví se zarovnání textu
        this.context.textBaseline = 'middle' //nastaví se vertikální zarovnání textu
        const gradient = this.context.createLinearGradient(0, 0, this.width, this.height) //vytvoří se gradient, jehož barvy určují směr částic, gradient je vytvořen od levého horního rohu do pravého dolního rohu
        gradient.addColorStop(0.2, 'white') //přidají se barvy do gradientu
        gradient.addColorStop(0.4, 'yellow')
        gradient.addColorStop(0.6, 'cyan')
        gradient.addColorStop(0.8, 'blue')
        ctx.fillStyle = gradient
        this.context.fillText('FLOW', this.width * 0.5, this.height * 0.5, this.width * 0.8) //vykreslí se text FLOW, dá se změnit a smrskává se podle velikosti canvasu, tak aby se vešel
    }
    drawFlowFieldImage(){ //funkce pro vykreslení obrázku
        let imageSizeWidth = this.width * 1 //velikost obrázku v poměru canvasu, pokud je canvas v jiném poměru než obrázek, tak se obrázek podivně roztáhne, obrázek se dá zmenšit podle toho kolik chceme aby zabíral canvasu, například 0.5, tak bude obrázek zabírat polovinu canvasu, tím že to je nastavené na 1 tak se obrázek vykreslí od hranic canvasu
        let imageSizeHeight = this.height * 1
        this.context.drawImage(this.image/*proměná obrázku*/, this.width * 0.5 - imageSizeWidth * 0.5/*vycentrování obrázku pomocí */, this.height * 0.5 - imageSizeHeight * 0.5, imageSizeWidth, imageSizeHeight)
    }
    init() {
        this.rows = Math.floor(this.height / this.cellsize) //nastaví se počet řádků a sloupců, které se vypočítají podle velikosti canvasu a cellsize
        this.cols = Math.floor(this.width / this.cellsize)
        this.flowField = [] //vytvoří se pole pro flowField
        
        //this.drawFlowFieldImage() //vykreslí se obrázek
        this.drawText() //vykreslí se text, ten je teď zakomentovaný, jelikož se vykresluje obrázek
        const pixels = this.context.getImageData(0, 0, this.width, this.height).data //získají se pixely z obrázku/textu, který se vykreslil
        for(let y = 0; y < this.height; y += this.cellsize){ //pro každý pixel se vypočítá jeho index v poli, a získá se barva a směr
            for(let x = 0; x < this.width; x += this.cellsize){
                const index = (x + y * this.width) * 4
                const red = pixels[index]
                const green = pixels[index + 1]
                const blue = pixels[index + 2]
                const alpha = pixels[index + 3]
                const grayscale = (red + green + blue) / 3
                const colorAngle = ((grayscale / 255) * Math.PI * 2).toFixed(2) //získá se směr, který je závislý na barvě, čím světlejší barva, tím větší směr, čím tmavší barva, tím menší směr, směr se určuje v rádianech, proto se vynásobí 2 * PI, dále je to zaokrouhleno na 2 desetinná místa
                this.flowField.push({ //barva a směr se uloží do pole flowField
                    x: x,
                    y: y,
                    red: red,
                    green: green,
                    blue: blue,
                    alpha: alpha,
                    colorAngle: colorAngle
                })
            }
        }
        //pro obrazce se dá použít následující kód, který vytvoří flowField, který je závislý na pozici, ale není závislý na barvě, ten je zakomentovaný, jelikož se používá obrázek/text
        /*for(let y = 0; y < this.rows; y++){
            for(let x = 0; x < this.cols; x++){
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve
                this.flowField.push(angle)
            }
        }*/

        this.particles = [] //vytvoří se pole pro částice
        for(let i = 0; i < this.numberOfParticles; i++){ //vytvoří se počet částic
            this.particles.push(new Particle(this))
        }
        this.particles.forEach(particle => particle.reset()) //každá částice se resetuje, aby se zvýšila šance na to, že se částice vygeneruje na barvě
    }
    drawGrid(){ //funkce pro vykreslení gridu, pouze viditelný v debug modu, pokud je cellsize = 1, tak je grid příliš hustý a nejde moct vidět, pokud se ale vykreslují obrazce, tak je lepší cellsize zvětšit a půjde poznat že v jednotlivých polích gridu se mění úhel směru částic
        this.context.save() //uloží se kontext canvasu aby se mohlo všechno vrátit zpět
        this.context.strokeStyle = 'gray' //nastaví se barva čar gridu
        this.context.lineWidth = 0.2 //nastaví se šířka čar gridu
        for(let c = 0; c < this.cols; c++){ //vykreslí se grid
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
        this.context.restore() //vrátí se kontext canvasu
    }
    resize(width, height){ //funkce pro změnu velikosti canvasu
        this.canvas.width = width //nastaví se šířka a výška canvasu
        this.canvas.height = height
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.init() //spustí se funkce init(), která všechno přepočítá
    }
    render(){ //funkce pro vykreslení
        if (this.debug) { //pokud je debug mode zapnutý, tak se vykreslí grid a text/obrázek
            this.drawGrid()
            this.drawText()
            //this.drawFlowFieldImage()
        }
        this.particles.forEach(particle => { //každá částice se vykreslí a updatuje
            particle.draw(this.context)
            particle.update()
        })
        
    }
}

const effect = new Effect(canvas, ctx) //vytvoření efektu
effect.render(ctx) //vykreslení efektu

function animate() { //funkce pro animaci
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    effect.render()
    requestAnimationFrame(animate)
}
animate()