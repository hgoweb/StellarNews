import StellarNewsSvg from '../../assets/svg/StellarNews-Logo.svg';
import UranusSvg from '../../assets/svg/uranus.svg';
import './StellarNewsLogo.scss';

type StellarNewsLogoProps = {
  height: string;
};

function StellarNewsLogo({ height }: StellarNewsLogoProps) {
  return (
    <div className="stellarNewsLogo" style={{ height: height }}>
      <img
        src={StellarNewsSvg}
        alt="StellarNewsLogo"
        className="stellarNewsLeft"
      />

      <img src={UranusSvg} alt="UranusLogo" className="stellarNewsRight" />
    </div>
  );
}

export default StellarNewsLogo;
