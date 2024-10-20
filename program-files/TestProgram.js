class TestProgram extends Program {
    constructor() {
        super()
        this.name = "Notepad"
        this.window;
        this.windowContent;
        this.width = "500";
        this.height = "300";
        this.top = "50%";
        this.left = "50%";
        this.textarea;
    }


    createWindow() {
        super.createWindow()
        this.iframe = document.createElement("iframe");
        this.iframe.src = "test.html"
        this.iframe.style.width = "100%"
        this.iframe.style.height = "100%"
        this.windowContent.appendChild(this.iframe);
    }

    run() {
        super.run();
    }
}

programClasses["TestProgram"] = TestProgram