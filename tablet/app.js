import {mountTabletNavigation} from "./components/navigation.js?v=2.84";
import {mount as mountMobile} from '../mobile/app.js?v=2.84';
/** The tablet owns its shell decoration, while mobile functional components are reused. */
export function mount(root,config,route){const destroy=mountMobile(root,config,route);const app=root.querySelector('.mobile-app');if(app)app.classList.add('tablet-app');const header=root.querySelector('.mobile-header');if(header){header.classList.add('tablet-header');mountTabletNavigation(header,config,route);root.querySelectorAll('main section').forEach(section=>{if(section.className&&typeof section.className==='string')section.classList.add('tablet-content-section');});}return destroy;}
