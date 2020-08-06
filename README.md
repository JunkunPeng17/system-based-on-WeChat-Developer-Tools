# system-based-on-WeChat-Developer-Tools

Our team developed our program based on WeChat DevTool. The inspector should use WeChat  
DevTool to open the project for accessing code files. This develop tool help developers  
develop and debug WeChat Mini Programs more simply and efficiently.  
The mini-program is composed of four code files:  
• .wxml: “WXML is a markup language for framework design. It can be used to build  
the page structure when combined with base components and event system.” WeChat  
Official Document  
• .js: “It is a scripting language for Mini Programs. Combined with WXML, it can be used  
to construct the page structure.” WeChat Official Document  
• .wxss: “WXSS is a set of style languages that describe WXML component styles, and  
is used to determine how WXML components are displayed.” WeChat Official  
Document  
• .json: Page configuration.  
Then we simply introduce files placed in the project’s root directory:  
• app.js: The project logic.  
• app.json: Global configurations for the whole project.  
• app.wxss: Global style sheet for the whole project.  
• pages: All pages of the project.  
• images: All images of the project.  
• compenets: Custom components used in the project.  
• cloud: WeChat cloud functions.   
