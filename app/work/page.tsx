import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';
import WorkSideBar from '@/components/Work/sideBar';

export default function WorkList() {
  return (
    <div className={s.container}>
      <WorkHeader/>
      <WorkSideBar/>
    </div>
  );
}