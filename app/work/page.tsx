import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';
import WorkSideBar from '@/components/Work/sideBar';
import WorkWindow from '@/components/Work/window';
import WorkBottomBar from '@/components/Work/bottomBar';

export default function WorkList() {
  return (
    <div className={s.container}>
      <WorkHeader/>
      <div className={s.contents}>
        <div className={s.three}>
          <div className={s.window}>
            <WorkWindow/>
          </div>
          <div className={s.add}>
            <WorkBottomBar/>
          </div>
        </div>
        <WorkSideBar/>
      </div>
    </div>
  );
}