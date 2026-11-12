import {worldProjection} from './worldProjection'
export function useWorldViewport(root:Ref<HTMLElement|undefined>){
 const size=reactive({width:1200,height:640})
 let observer:ResizeObserver|undefined
 function measure(){if(root.value){size.width=root.value.clientWidth;size.height=root.value.clientHeight}}
 function attach(){observer?.disconnect();measure();if(root.value){observer=new ResizeObserver(measure);observer.observe(root.value)}}
 watch(root,attach)
 onMounted(attach)
 onBeforeUnmount(()=>observer?.disconnect())
 return computed(()=>worldProjection(size.width,size.height))
}
