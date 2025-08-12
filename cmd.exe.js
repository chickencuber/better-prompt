const c = JSON.parse(await FS.getFromPath("/user/better-prompt/conf.json"));
if(Shell.supports_fansi) {
    Shell.terminal.background = c.background || 0;
}
Shell.terminal.clear();
function renderline(opt) {
    let str = "";
    for(let i of opt) {
        const fg = i.fg || "#ffffff";
        const bg = i.bg || "#000000";
        if(Shell.supports_fansi) {
            str += `\x1bf[${fg.slice(1)}m\x1bb[${bg.slice(1)}m`
        }
        switch(opt.type) {
            case "text": {
                str += opt.text;
            }
                break;
            case "var": {
                str += Shell.localVars[opt.var];
            }
                break;
        }
    } 
    Shell.terminal.add(str);
}

console.log(c);
renderline(c.startup);

