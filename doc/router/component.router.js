



const requireComponent = require.context("../markdown/components/", true, /\.md$/);
console.log("requireComponent.keys():",  requireComponent.keys() );
requireComponent.keys().forEach(item => {
    console.log(requireComponent(item));
});

const nav = [
    {
        title : "开发指南", 
        children : [{
            path : "install",
            component : "isntall"
        }]
    },
    {
        title : "组件", 
        childrens : [{
            subtitle : "basic",
            children : [
                {
                    path : "layout",
                    component : "layout"
                }
            ]
        },{
            subtitle : "Form",
            children : [
                {
                    path : "radio",
                    component : "radio"
                }
            ]
        }]
    }
];

const routers = [];
for (let i = 0; i < nav.length; i++) {
    const arr = nav[i];
    console.log(arr ,"arr");
    if( arr.children ) {
        arr.children.forEach(item => {
            routers.push(item);
        });
    }
    if( arr.childrens ) {
        for (let j = 0; j < arr.childrens.length; j++) {
            const arrChild = arr.childrens[j];
            arrChild.children.forEach(item => {
                routers.push(item);
            });
        }
    }
}


export default {
    routers , 
    nav
};