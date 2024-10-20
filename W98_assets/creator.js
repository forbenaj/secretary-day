class Creator {
    constructor(){
        this.window = document.createElement("div")
        this.window.id = "Creator"

        this.projectName = "MyProject"

        this.modified = false

        this.currentState = rooms.slice()
        this.states = [this.currentState]

        this.containerTop = document.createElement("div")
        this.containerTop.className = "container-horizontal"

        this.containerMain = document.createElement("div")
        this.containerMain.className = "container-horizontal"

        this.window.appendChild(this.containerTop)
        this.window.appendChild(this.containerMain)

        /*window.addEventListener('beforeunload', function (event) {
            // Cancel the event (prevents the browser from closing)
            event.preventDefault();
            // Prompt the user with a custom message
            event.returnValue = 'Are you sure you want to leave?';
            
          });*/
    }
    initialize(){
        this.containerTop.appendChild(controls.window)

        this.containerMain.appendChild(treeview.window)
        this.containerMain.appendChild(viewer.window)
        this.containerMain.appendChild(inspector.window)
    }
    undo(){
        console.log("undone")
    }
}

let types = ["room","door","actor","item","holder"]

function iconOf(type){
    if(type == "room"){
        return " 🎬 "
    }
    else if(type == "door"){
        return " 🚪 "
    }
    else if(type == "actor"){
        return " 🐥 "
    }
    else if(type == "item"){
        return " 📦 "
    }
    else if(type == "holder"){
        return " 🔲 "
    }
    else{
        return " 📃 "
    }

}

async function saveFile(blob,opts){

    if( window.showSaveFilePicker ) {
        console.log("new method")
        const handle = await showSaveFilePicker(opts);
        const writable = await handle.createWritable();
        await writable.write( blob );
        writable.close();
    }
    else {
        console.log("legacy method")
        const saveLink = document.createElement( "a" );
        saveLink.href = URL.createObjectURL( blob );
        saveLink.download= opts.suggestedName+".cosa";
        saveLink.click();
        setTimeout(() => URL.revokeObjectURL( saveLink.href ), 60000 );
    }
}

async function openFile(opts) {
    if (window.showOpenFilePicker) {
        console.log("Opening file by new method")
        const [fileHandle] = await showOpenFilePicker(opts);
        const file = await fileHandle.getFile();
        return file;
    } else {
        console.log("Opening file by legacy method")
        return new Promise((resolve, reject) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = opts?.types?.map(type => `.${type}`).join(",");
            input.addEventListener("change", async () => {
                const file = input.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error("No file selected"));
                }
            });
            input.click();
        });
    }
}

function isInside(item, parent) {
    if(parent.children){
        for (let i = 0; i < parent.children.length; i++) {
            const element = parent.children[i];
            if (element == item) {
                return true;
            }
            else if (element.children) {
                if (isInside(item, element)) {
                    return true;
                }
            } 
        }
    }

    return false;
}

let creator = new Creator()

class ContextMenu {
    constructor(){
        this.container = document.createComment("div")
        document.addEventListener("contextmenu",(event)=> this.display(event))
        this.leftClickHandler = this.leftClickHandler.bind(this)
    }
    rightClickHandler(){

    }
    leftClickHandler(event){
        let element = event.target
        if(element.className != "disabled" && element.className != "divider" && element.className!= "context-menu"){
            console.log(element.className)
            this.hide()
        }
    }
    display(event){

        let element = event.target
        event.preventDefault()
        if(element.context){
            this.hide()

            setTimeout(1000)

            const rect = document.body.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            

            element.context.items.action = () => {
                element.context.items.action()
            }
            
            this.container = W98.Menu(element.context.items,"context-menu")
            this.container.id = "contextMenu"
            
            document.addEventListener("click",this.leftClickHandler)
            document.addEventListener("contextmenu",this.leftClickHandler)

            element.context.onOpen()
            
            this.container.style.left = mouseX+"px"
            this.container.style.top = mouseY+"px"
            
            document.body.appendChild(this.container)
        }

        
    }
    hide(){
        document.removeEventListener("click",this.leftClickHandler)
        document.removeEventListener("contextmenu",this.leftClickHandler)
        this.container.remove()
    }
}

let contextMenu = new ContextMenu()

class Controls {
    constructor(){
        this.window = W98.Window("Controls")

        this.undoButton = document.createElement("button")
        this.undoButton.innerText = "Undo ↩"
        this.undoButton.onclick = ()=>creator.undo()
        this.redoButton = document.createElement("button")
        this.redoButton.innerText = "Redo ↪"

        this.playButton = document.createElement("button")
        this.playButton.innerText = "Play"
        this.stopButton = document.createElement("button")
        this.stopButton.innerText = "Stop"


        this.window.body.appendChild(this.undoButton)
        this.window.body.appendChild(this.redoButton)
        this.window.body.appendChild(this.playButton)
        this.window.body.appendChild(this.stopButton)
    }
}

let controls = new Controls()

class Treeview {
    constructor(obj) {

        this.obj = obj
        this.window = W98.Window("Treeview")
        this.window.id = "treeview"

        let addButton = document.createElement("button")
        addButton.innerText = "Add element"
        addButton.onclick = ()=>this.openAddElementDialog(this.obj)
        this.inputs = []

        this.container = document.createElement('div')
        this.container.className = 'treeviewContainer'

        let loadButton = document.createElement("button")
        loadButton.innerText = "Load project..."
        loadButton.onclick = ()=>this.loadProject()

        let saveButton = document.createElement("button")
        saveButton.innerText = "Save project..."
        saveButton.onclick = ()=>this.saveProject()

        this.window.body.appendChild(addButton)
        this.window.body.appendChild(this.container)
        this.window.body.appendChild(loadButton)
        this.window.body.appendChild(saveButton)

        this.createNestedList(this.obj,this.container)
        this.container.ondragover = (e) => this.onDragOver(e,this.container)
        this.container.ondragleave = (e) => this.onDragLeave(e,this.container)
        this.container.ondrop = (e) => this.onDrop(e,this.container)

        this.dragItem = null
        this.dragItemParent = null

    }

    reload(){
        let newContainer = document.createElement('div')
        newContainer.className = 'treeviewContainer'
        
        this.window.body.replaceChild(newContainer, this.container);

        this.container = newContainer
        
        this.createNestedList(this.obj,this.container)
        this.container.ondragover = (e) => this.onDragOver(e,this.container)
        this.container.ondragleave = (e) => this.onDragLeave(e,this.container)
        this.container.ondrop = (e) => this.onDrop(e,this.container)

        this.window.titleBarText.innerText = "Treeview - "+creator.projectName +( creator.modified? " (*)" : "")
    }

    createNestedList(items,parentDiv) {
    
        items.forEach((item) => {
            if (item.name) {
                let divItem = document.createElement('div');
                divItem.classList.add("listItem")
                divItem.ondragover = (e) => this.onDragOver(e,divItem,item)
                divItem.ondragleave = (e) => this.onDragLeave(e,divItem)

                
                let span = document.createElement('span')
                span.className = "itemTitle"
                span.innerText = iconOf(item.type)+item.name;
                span.id = item.id

                span.item = item

                span.context= {
                    items:[
                        {name:"Inspect",class:"bold-item", action: ()=>this.openElement(item)},
                        {name:"Add Child",class:"", action: ()=>this.openAddElementDialog(item.children)},
                        {name:"",class:"divider", action: ()=>console.log("divider")},
                        {name:"Disabled",class:"disabled", action: ()=>console.log("Disabled")},
                        {name:"Delete",class:"", action: ()=>console.log("Delete")}
                    ],
                    onOpen: () => this.selectElement(item,span)
                }

                span.addEventListener("dblclick",()=> this.openElement(item))
                
                span.addEventListener("click",()=> this.selectElement(item))

                //span.addEventListener("contextmenu",(event)=> this.openContextMenu(event,item,span))
                
                span.draggable = true
                span.ondragstart = (e) => this.onDrag(e,item,items)

                divItem.ondrop = (e) => this.onDrop(e,divItem,item)

                if (item.children) {

                    let childrenContainer = document.createElement('div');
                    childrenContainer.className = item.expanded? "expanded":"collapsed";
                    childrenContainer.classList.add("childrenContainer")

                    let button = document.createElement('input')
                    button.type = 'button'
                    button.className = "expandButton"
                    button.value = item.expanded? "-":"+";
                    button.onclick = () => this.toggleExpand(item,childrenContainer,button)
                    

                    divItem.classList.add("expandable")
                    divItem.appendChild(button)
                    divItem.appendChild(span)
                    divItem.appendChild(childrenContainer)

                    this.createNestedList(item.children, childrenContainer);
                }
                else{
                    divItem.appendChild(span)
                }
                parentDiv.appendChild(divItem);
            }
        });
    }

    toggleExpand(item,container,button) {
        if(!item.expanded){
            button.value="-"
            container.className = "expanded"
            item.expanded = true
        }
        else{
            button.value="+"
            container.className = "collapsed"
            item.expanded = false
        }
    }

    openElement(item) {
        let selectedElements = document.querySelectorAll('.openedElement');
        selectedElements.forEach(function(e) {
            e.classList.remove('openedElement');
        });
        let element = document.getElementById(item.id)
        element.classList.add("openedElement")
        
        if(item.type == "room") {
            viewer.goTo(item)
        }

        inspector.inspect(item)

    }

    selectElement(item) {
        let selectedElements = document.querySelectorAll('.selectedElement');
        selectedElements.forEach(function(e) {
            e.classList.remove('selectedElement');
        });
        let element = document.getElementById(item.id)
        element.classList.add("selectedElement")
        if(item.type == "door") {
            viewer.markAsSelected(item)
            viewer.redrawScene()
        }
    }

    openContextMenu(event){

        
    }

    openAddElementDialog(parent){

        let newElementWindow = W98.Window("Create new element",["Close"])
        newElementWindow.id = "newElementWindow"

        let group = W98.Group("New element")

        let typeContainer = W98.Dropdown("Type",types,0,"type")
        this.inputs.push(typeContainer.input)

        let nameContainer = W98.TextBox("Name","","name")
        this.inputs.push(nameContainer.input)

        let idContainer = W98.TextBox("ID","","id")
        this.inputs.push(idContainer.input)

        let imageContainer = W98.ImageLoad("Image","images/testImage.png","image")
        this.inputs.push(imageContainer.input)

        let saveButton = document.createElement("button")
        saveButton.innerText = "Save"
        saveButton.onclick = ()=>this.addElement(parent)

        group.appendChild(typeContainer)
        group.appendChild(nameContainer)
        group.appendChild(idContainer)
        group.appendChild(imageContainer)
        newElementWindow.body.appendChild(group)
        newElementWindow.body.appendChild(saveButton)

        document.body.appendChild(newElementWindow)
    }
    
    addElement(parent){
        let ready = true;
        let newElement = {
            name: "",
            type: "",
            id: "",
            image:""
        }

        for(let input of this.inputs){
            if(input.value == ""){
                console.log("Missing "+input.id)
                ready = false
                
                input.style.backgroundColor = "yellow";
  
                setTimeout(() => {
                    input.style.transition = "background-color 2s";
                    input.style.backgroundColor = "";
                }, 500);

                //break
            }
            else{
                console.log(input.id+" ready ("+input.value+")")
                newElement[input.id] = input.value
            }
            
        }

        if(newElement.type == "room"){
            newElement.children = []
        }
        console.log(ready)
        if(ready){
            parent.push(newElement)
            this.reload()
            //viewer.reload()

            this.openElement(newElement)
        }

    }

    onDrag(e,item,parent){
        e.dataTransfer.effectAllowed = "copyMove";
        this.dragItem = item;
        this.dragItemParent = parent;
    }

    onDrop(e,div,item){
        e.preventDefault();
        e.stopPropagation()
        if(!item){
            this.obj.push(this.dragItem)

            let itemIndex = this.dragItemParent.indexOf(this.dragItem)
            this.dragItemParent.splice(itemIndex,1)
        }
        else{
            if(item == this.dragItem){console.log("Cannot drop element inside itself!")}
            else if(item.children){
                if(isInside(item,this.dragItem)){console.log("Cannot drag item inside its children")}
                else {
                    item.children.push(this.dragItem)

                    let itemIndex = this.dragItemParent.indexOf(this.dragItem)
                    this.dragItemParent.splice(itemIndex,1)
                }
            }
            else{console.log("Item has no children")}
        }


        if(div.classList.contains("draggingOver")){
            div.classList.remove("draggingOver")
        }
        this.reload()

    }

    onDragOver(e,div,item){
        e.preventDefault()
        e.stopPropagation();
        /*if(item.children){
            if(!div.classList.contains("draggingOver")){
                div.classList.add("draggingOver")
            }
        }
        else{
            //e.dataTransfer.dropEffect = "none";
            if(!div.classList.contains("noDraggingOver")){
                div.classList.add("noDraggingOver")
            }
        }*/
        
        if(item && (item == this.dragItem || !item.children || isInside(item,this.dragItem))){
            e.dataTransfer.dropEffect = "none";
            if(!div.classList.contains("noDraggingOver")){
                div.classList.add("noDraggingOver")
            }
        }
        else{
            if(!div.classList.contains("draggingOver")){
                div.classList.add("draggingOver")
            }
        }
    }
    onDragLeave(e,div){
        //if(e.target.classList.contains("listItem")){
            if(div.classList.contains("draggingOver")){
                div.classList.remove("draggingOver")
            }
            if(div.classList.contains("noDraggingOver")){
                div.classList.remove("noDraggingOver")
            }
        //}
    }

    async saveProject(){
        
        // Convert the object to a JSON string
        let jsonString = JSON.stringify(this.obj, null, 4);
        
        // Create a Blob containing the JSON string
        let blob = new Blob([jsonString], { type: "application/json" });

        
        const opts = {
            types: [
                {
                  description: "Cosas Creator Project",
                  accept: { "application/cosa": [".cosa"] }
                },
                {
                  accept: { "text/plain": [".txt"] }
                },
                {
                  accept: { "application/json": [".json"] }
                },
            ],
            suggestedName: creator.projectName
        };

        try{
            await saveFile(blob,opts)
            creator.modified = false
            this.reload()
        }
        catch(error){console.log(error)}

        
        
        /*// Create a link element
        var a = document.createElement("a");
        
        // Set the link's href to the URL of the Blob
        a.href = URL.createObjectURL(blob);
        
        // Set the download attribute to specify the filename
        a.download = "";
        
        // Append the link to the document
        document.body.appendChild(a);
        
        // Simulate a click on the link to trigger the download window
        a.click();
        
        // Remove the link from the document
        //document.body.removeChild(a);*/
        
                
    }

    async loadProject(){
        const opts = {
            types: [
                {
                  description: "Cosas Creator Project",
                  accept: { "application/cosa": [".cosa"] }
                },
                {
                  accept: { "text/plain": [".txt"] }
                },
                {
                  accept: { "application/json": [".json"] }
                },
            ],
            multiple: false,
        };
        try{
            let file = await openFile(opts)
            let contents = await file.text()
            const jsonObject = JSON.parse(contents);

            rooms = jsonObject
            this.obj = rooms

            this.reload()
        }
        catch(error){console.log(error)}
        /*let fileHandle

        [fileHandle] = await window.showOpenFilePicker(opts);
          
        console.log(fileHandle)*/
    }
}

let treeview = new Treeview(rooms)


class Viewer {
    constructor(id){
        this.id = id;

        this.currentRoom;
        
        this.window = W98.Window("Viewer");

        this.window.id = "roomEditor";
        //this.window.style.width = "800px"
        //this.window.style.height = "600px"

        this.canvas = document.createElement("canvas");
        this.canvas.width = 800; // T h i s                b e                 e l s e w h e r e
        this.canvas.height = 600; //         s h o u l d        d e f i n e d
        this.window.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        this.mousedown = false;
        this.draggingPoint = null;
        this.draggingChild = null;

    }

    reload() {
        let newCanvas = document.createElement("canvas");
        newCanvas.width = 800; // T h i s                b e                 e l s e w h e r e
        newCanvas.height = 600; //         s h o u l d        d e f i n e d

        this.window.body.replaceChild(newCanvas, this.canvas);

        this.canvas = newCanvas;
        this.ctx = this.canvas.getContext('2d');

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //this.canvas.removeEventListener('click', (event) => this.handleCanvasClick(event, door))
        this.setBackground(this.currentRoom.image)
        
        this.loadChildren()
        this.setupListeners()
        
        this.window.titleBarText.innerText = "Viewer - Editing "+this.currentRoom.name
    }

    redrawScene() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.loadChildren()
    }

    drawImage(src,x,y,r,h,w){
        
        let image = new Image()
        image.src = src
        
        this.ctx.save();
        this.ctx.translate(x,y);
        this.ctx.rotate(r);
        this.ctx.scale(h, w);
        this.ctx.drawImage(image, -image.width / 2, -image.height / 2);
        this.ctx.restore();
    }

    drawPolygon(points, fillColor, lineColor) {

        if (points.length < 3) {
            console.error('A polygon needs at least 3 points.');
            return;
        }
    
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
    
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
    
        this.ctx.closePath();
        this.ctx.fillStyle = fillColor
        this.ctx.fill()
        this.ctx.strokeStyle = lineColor
        this.ctx.lineWidth = "2px"
        this.ctx.stroke();
    }

    makePolygon(points) {

        if (points.length < 3) {
            console.error('A polygon needs at least 3 points.');
            return;
        }
    
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
    
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
    
        this.ctx.closePath();
    }

    drawCorners(child) {
        if (child.points.length < 3) {
            console.error('A polygon needs at least 3 points.');
            return;
        }
        this.ctx.fillStyle = "yellow"
        for (let i = 0; i < child.points.length; i++) {
            let x = child.points[i].x-5
            let y = child.points[i].y-5

            this.ctx.fillRect(x,y,10,10)
        }

    }

    markAsSelected(childToSelect) {
        for (let child of this.currentRoom.children){
            if(child.type == "door"){
                child.selected = false;
            }
        }
        childToSelect.selected = true;
    }

    /*setSize(x,y){
        this.window.style.width = x
        this.window.style.height = y

    }*/

    setBackground(src){
        this.window.body.style.backgroundImage = "url("+src+")"
    }

    goTo(item){

        //let newRoom = rooms.find(room => room.id === roomId);
        
        this.currentRoom=item;

        this.reload()
    }

    setupListeners() {
        
        this.canvas.addEventListener('mousedown', (event) => this.onMouseDown(event))
        this.canvas.addEventListener('mousemove', (event) => this.onDrag(event))
        this.canvas.addEventListener('mouseup', (event) => this.onMouseUp(event))
        this.canvas.addEventListener('dblclick', (event) => this.onDoubleclick(event))
        //this.canvas.addEventListener('click', (event) => this.onClick(event))
    }

    loadChildren(){
        for (let child of this.currentRoom.children){
            if(child.type == "door"){
                if("selected" in child == false || child.selected == false){
                    child.selected = false
                    this.drawPolygon(child.points,"rgba(128,128,128,0.5)","black")
                }
                else if(child.selected == true){
                    this.drawPolygon(child.points,"rgba(128,128,255,0.5)","blue")
                    this.drawCorners(child)
                }
            }
        }

    }

    onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        for (let child of this.currentRoom.children){
            if(child.type == "door"){
                
                // Check if the click point is inside the polygon
                this.makePolygon(child.points);
                if (this.ctx.isPointInPath(mouseX, mouseY)) {
                    // Call the click event function for the specific polygon
                    //if(!child.selected){
                        child.selected = true;
                    //}
                    //else{
                        //child.selected = false;  
                    //}
                }
                else{
                    child.selected = false;
                }
            }
        }
        this.redrawScene()
    }


    onMouseDown(event){
        let pressedButton = event.button === 0? "left" : event.button === 1 ? "middle" : event.button === 2 ? "right" : "";
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.mousedown = true
        if(pressedButton=="left"){
            for (let child of this.currentRoom.children){
                if(child.type == "door"){


                    if(child.selected){
                        for(let point of child.points){
                            let onPointX = mouseX >= point.x-5 && mouseX <= point.x+5
                            let onPointY = mouseY >= point.y-5 && mouseY <= point.y+5

                            if(onPointX && onPointY){
                                point.x = mouseX
                                point.y = mouseY
                                this.draggingPoint = point
                            }
                        }
                    }
                    if(this.draggingPoint == null){
                        this.makePolygon(child.points);
                        if (this.ctx.isPointInPath(mouseX, mouseY)) {
                            // Call the click event function for the specific polygon
                            if(!child.selected ){
                                child.selected = true;
                            }
                            if(child.selected){
                                for(let point of child.points){
                                    point.deltaX = mouseX-point.x
                                    point.deltaY = mouseY-point.y

                                }
                                this.draggingChild = child

                            }
                        }
                        else{
                            child.selected = false
                        }
                    }


                }
            }
            this.redrawScene()
        }
    }

    onDrag(event) {
        if(this.mousedown){
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;


            if(this.draggingPoint != null){
                creator.modified = true
                
                this.draggingPoint.x = mouseX
                this.draggingPoint.y = mouseY
            }

            if(this.draggingChild != null){
                creator.modified = true

                for(let point of this.draggingChild.points){

                    point.x = mouseX-point.deltaX
                    point.y = mouseY-point.deltaY
                }
            }

            this.redrawScene()
        }
    }
    
    onMouseUp(){
        this.mousedown = false
        this.draggingPoint = null
        this.draggingChild = null
        treeview.reload()
        /*for (let child of this.currentRoom.children){
            if(child.type == "door"){
                for(let point of child.points){
                    point.isDragging = false;
                }

            }
        }*/
    }
    onDoubleclick(event){
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        for (let child of this.currentRoom.children){
            if(child.type == "door"){


                this.makePolygon(child.points);
                if (this.ctx.isPointInPath(mouseX, mouseY)) {
                    // Call the click event function for the specific polygon
                    if(!child.selected ){
                        child.selected = true;
                    }
                    treeview.openElement(child)
                }
                else{
                    child.selected = false
                }
                


            }
        }
        this.redrawScene()
        
    }

}


let viewer = new Viewer("main")


class Inspector {
    constructor(){
        this.window = W98.Window("Inspector")
        this.window.id = "inspector"

    }

    inspect(obj){

        this.window.body.remove()
        this.window.body = document.createElement("div")
        this.window.body.className = "window-body"

        this.window.titleBarText.innerText = "Inspector - "+obj.name

        this.group = W98.Group(iconOf(obj.type)+obj.name)
        this.group.id = obj.id+"-properties"

        this.inputs = []
        
        for(let key in obj){
            if(key == "name"){
                let nameContainer = W98.TextBox("Name",obj.name,key)
                this.group.appendChild(nameContainer)
                this.inputs.push(nameContainer.input)
            }
            if(key == "id"){
                let idContainer = W98.TextBox("ID",obj.id,key)
                this.group.appendChild(idContainer)
                this.inputs.push(idContainer.input)
            }
            if(key == "image"){
                let imageContainer = W98.ImageLoad("Image",obj.image,key)
                this.group.appendChild(imageContainer)
                this.inputs.push(imageContainer.input)
            }
        }

        let saveButton = document.createElement("button")
        saveButton.innerText = "Save"
        saveButton.onclick = ()=>this.save(obj)

        this.window.appendChild(this.window.body)
        this.window.body.appendChild(this.group)
        this.window.body.appendChild(saveButton)

    }
    save(obj){

        creator.modified = true

        for(let input of this.inputs){
            obj[input.id] = input.value
            if(input.id == "name"){
                this.group.legend.innerText = iconOf(obj.type)+input.value

                
                
            }
        }
        treeview.reload()
        viewer.reload()
        /*for(let key in obj){
            if(key == "name"){
                let inputField = this.group.querySelector("#"+obj.name)
            }
            if(key == "id"){
                let idContainer = W98.TextBox("ID",obj.id)
                this.group.appendChild(idContainer)
            }
        }*/
    }
}

let inspector = new Inspector()