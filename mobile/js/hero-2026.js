/** 1.51: külön telefonos főképernyő; asztali képsor létre sem jön. */
import {createFreshMobileHero} from '../mobile/reboot-hero-v1-43-29.js?v=1.51';
import {createPicture,mediaItem} from './media.js?v=1.51';
import {settingNumber,isWithinConfiguredWindow} from './site-settings-2026.js?v=1.51';
export function renderPremiumHero(block){
 if(!isWithinConfiguredWindow('runtime.hero'))return null;
 const data=block?.data||{};
 const slides=(Array.isArray(data.slides)&&data.slides.length?data.slides:[data])
  .filter(item=>item&&typeof item.mediaId==='string'&&(!data.logoSafeOnly||item.logoSafe===true))
  .slice(0,settingNumber('runtime.hero.maxSlides'));
 if(!slides.length)return null;
 const section=document.createElement('section');
 section.className='csn26-visual-map cs41-home-hero';
 section.setAttribute('aria-label',String(data.eyebrow||document.title));
 section.append(createFreshMobileHero({slides,createPicture,mediaItem,intervalMs:data.intervalMs,ui:data.mobileUi}));
 const heading=document.createElement('h1');heading.className='visually-hidden';
 heading.textContent=document.title;section.append(heading);
 return section;
}
