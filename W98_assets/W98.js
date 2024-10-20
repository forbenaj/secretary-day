const W98 = {
    Window: (name,buttons)=>{
        let window = document.createElement("div")
        window.className = "window"
    
        window.titleBar = document.createElement("div")
        window.titleBar.className = "title-bar"
        window.titleBarText = document.createElement("div")
        window.titleBarText.className = "title-bar-text"
        window.titleBarText.innerText = name
        window.titleBarControls = document.createElement("div")
        window.titleBarControls.className = "title-bar-controls"
        window.titleBar.appendChild(window.titleBarText)
        window.titleBar.appendChild(window.titleBarControls)

        if(buttons){
            for(let buttonName of buttons) {
                let button = document.createElement("button")
                button.ariaLabel = buttonName
                window.titleBarControls.appendChild(button)
                if(buttonName == "Close") {
                    button.onclick = () => window.remove()
                }
            }
        }
        
    
        window.body = document.createElement("div")
        window.body.className = "window-body"
    
        window.appendChild(window.titleBar)
        window.appendChild(window.body)
            
        let $jWindow = $(window)
        //$jWindow.resizable({ handles: "all", alsoresize: ".window-body" });
        $jWindow.draggable({ handle: "div.title-bar", containment: "window"});

        return window
    },
    TextBox: (title,value,id)=>{
        let container = document.createElement("div")
        container.className = "field-row"

        let label = document.createElement("label")
        label.setAttribute('for', id)
        label.innerText = title

        container.input = document.createElement("input")
        container.input.id = id
        container.input.type = "text"
        container.input.value = value

        container.appendChild(label)
        container.appendChild(container.input)
        return container
    },
    Dropdown: (title,items,index,id)=>{
        document.createElement("select")

        let container = document.createElement("div")
        container.className = "field-row"


        let label = document.createElement("label")
        label.setAttribute('for', id)
        label.innerText = title

        container.input = document.createElement("select")
        container.input.id = id
        for(let item of items){
            let optionContainer = document.createElement("option")
            optionContainer.innerText=item

            container.input.appendChild(optionContainer)
        }

        container.appendChild(label)
        container.appendChild(container.input)
        return container
    },
    MenuBar: (items)=>{
        let container = document.createElement("div")
        container.className = "menu-bar"
        container.item = {}

        for(let item of items){
            container.item[item] = document.createElement("div")
            container.item[item].className = "menu-bar-item"
            container.item[item].button = document.createElement("button")
            container.item[item].button.setAttribute("aria-label",item)
            container.item[item].button.innerText = item
            container.item[item].appendChild(container.item[item].button)

            container.appendChild(container.item[item])
        }
        return container
    },
    Menu: (items,type)=>{

        let container = document.createElement("ul")
        container.className = type
        container.item = {}

        for(let item of items){
            container.item[item.name] = document.createElement("li")
            container.item[item.name].className = item.class
            container.item[item.name].innerText = item.name
            container.item[item.name].onclick = ()=>item.action()

            container.appendChild(container.item[item.name])
        }
        return container
    },
    Group: (title)=>{
        let container = document.createElement("fieldset")
        container.legend = document.createElement("legend")
        container.legend.className = "type-title"

        container.legend.innerText = title

        container.appendChild(container.legend)

        return container
    },
    ImageLoad: (title,value,id)=>{
        let container = document.createElement("div")
        container.className = "field-row"

        let label = document.createElement("label")
        label.setAttribute('for', id)
        label.innerText = title

        container.imgSection = document.createElement("div")
        container.imgSection.className = "imageSection"

        container.input = document.createElement("input")
        container.input.id = id
        container.input.type = "text"
        container.input.value = value
        
        container.preview = document.createElement("img")
        container.preview.src = value
        container.preview.className = "preview"
        
        container.fileButton = document.createElement("input")
        container.fileButton.type = "file"
        container.fileButton.setAttribute("accept","image/*")
        container.fileButton.setAttribute("hidden","")

        container.loadButton = document.createElement("input")
        container.loadButton.type = "button"
        container.loadButton.className = "loadButton"
        container.loadButton.value = "🔎"
        container.loadButton.onclick = ()=> container.fileButton.click()

        container.setupFile = ()=> {

            // Get the selected file
            let file = container.fileButton.files[0];

            // Check if a file is selected
            if (file) {
                // Create a FileReader object
                let reader = new FileReader();

                // Set the function to execute when the file is loaded
                reader.onload = function(e) {
                    // Set the source of the image to the loaded file
                    container.input.value = e.target.result;
                    container.preview.src = e.target.result;
                };

                // Read the file as a data URL
                reader.readAsDataURL(file);
            }
        }

        container.fileButton.addEventListener("change",()=> container.setupFile())

        container.appendChild(label)
        container.imgSection.appendChild(container.fileButton)
        container.imgSection.appendChild(container.loadButton)
        //container.imgSection.appendChild(container.input)
        container.imgSection.appendChild(container.preview)
        container.appendChild(container.imgSection)
        return container
    }
}
