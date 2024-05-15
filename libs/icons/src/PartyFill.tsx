import { IconSize } from './types';
import { getIconSizeInPixel } from './utils';

export const PartyFill: React.FC<{ size?: IconSize; maxWidth?: number }> = ({
  size = 'md',
  ...props
}) => {
  const imageSize = getIconSizeInPixel(size);
  return (
    <img
      style={{
        maxWidth: imageSize,
        ...props,
      }}
      src={
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAZCAYAAAArK+5dAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAbYSURBVHgBrVQLUFTXGf7va++9+36wyy67gLIgD3VZSkA0EZ9YHTG+mgw2Y+ojo3WosTGYmqaOsR2bTrFGGRmNxZjmSeKjNILBZwNNpJZNRYTwTkBgd1lY2Pf73u1lOziGidMmk2/m3nP/e8//f//5vnMuQAxRBB4Bc872ZPgesK86KJ4c0fzn/DONux1X9Vt7E6dPajKUzNOIRf2ehc9fWgyAF/wumPmogr7iV7S+Zyp0UzG9bvXJiZ9XvYAyIvZCVOgt7TubOjg9KWXtukAPG9yFRMPzTmw8WkUTzO3C347+9NsIEEDOexHf3qk41NPRKILoHtTnDYxHInHlGWW+8szd1oJbH+nolluztJOTSIT4M6bVZHf47fuSPJZF4rBzG3qz9uK3EdiQ8HORoPM1k2y5ZDKONHyGsf2DYUS/4qKK0uQ84w4FdwkEVLWp/FkZhrpXXzlsLQtZNQbPeLha3q+aKNLmWM0yTVJq9YuDj5KpO3/TKR2t7Q6gaDppdykmmFAljinmsYhQRMnAeeRuZeLpK7kLVDg/eH2mkvjAznxFq5XCXw/NtZWN30x00AKh0rjPtiwYDY12HNHV2fVrE4Ug2tJFBK8bOs81DSGMzesbTM1p/nDnFClKMNbckGcARu1Mc/LG/pzSqv2esS+c0uiMRFqvF8M4zRByCXGcpbh38R4NQdMr5QppViw5M+0xxJi11y7hRbsLd+9ssw+cbnePLV3MbYgHBO0f5V7hsZ6aRFmAiVOHEWmy8ohcJd4R4AnBq04CuRSHJBUfeAgKiOHe+RMyw+efvywsjyVLFVT08Sewhtvv/etvlOPdjckFmbO0Sb/4lLNgiiDG1PbO/I7JMXVrozIRCxaJE+L04QALYwEAdaIKVGQE/AEehCiCMmTIK6zncW3JiZ7f2EfM9mSKFC0ybhEvufqWYx/Atem+oA8HaajkFc1YuzlCGBA2EuE+suAOEeDHuT6EAhAoQ4BLBaBMU/+q9qChSuHxmUJ9HQfcGC/0zbJRRLPDxJevuiz+xgletf1WTqHnszck6rl5c/OPAhl1A4lFgeLqx2E0kGoGSAkPEAzjLhZcZse1rWeLn7Zon59D8OmVAgIpIHmEnkKjSh6B8jEUYfCHCdYIn2YUKU/lffXFfBig18Fs44echgFAUQQ8ONd9IApuhge0EIEBZwrUDywvgpSiCU1UyMhxplvIR0w4Evgny7DD/gn3SCQSHokRdPxk/+LR9ntqm+LrWZr0ezDabQTrnSxQiIshJb0GMG4VGIZChMVBQKLQ2DUHjt45AOLoGGzQ/wUyxKar5ReDa948d46Z7gE2eStNNm7z+JxL9IXsSjeOyeI1beDrzQZbbwYQoniI13YDSaBAcVqRAgpmpk+APvQp7Ep/A4yKFoijbGm5ikHbiVp783SCBx6c3Lx0ae4a5EYwEAQpHoSwSwV3b5QCG4yH2cvaYHb+BaD5DGBymjNEAECpYOTWKGDDt4FkGXC5GE8XSS4zrlQXyuNv/okrHH2wgknMz9j7si7rfq6QdQGfk4QQBkCb2gUOcy44h7O4/WSEeOMYoEpOBUrEZbAglATg/pcWGLS5IRwI8MJCmknLVe9oK054X63r90zWj60gKwt4z/7oYl9y2te6nLRqEHEEIZIHFIlzHcRBj2kv4Ew2JMxAQbOiHjB1A0TdFuhucsGdpn4Yd7gmvL7Qwd5/8868dtWIKxSfuEYql9QQItwSM3n/pjnFEeeQbqgpB9Lih0CgagKShwNNEyCQhmDB9uPguF8C+HAR95d8Er50iaFzsBJGPGO2SMhVMWD2Vx6rcTgma51WWP5rLo//No5g7TECtUayntDUgbdrFrTUr4e8DQJIkjWBQEYBruT0juODVFMPYUsDNJ4SQf1lxj0+kXHKEpf/liX3ycdbauY4pqR2vf3YSzjr7+NvqbsQO8mly/IVKIGtpwkvPLGhgus6Au2fbAabfQ/gGhVXnI4paTYNwMdVl/yt9qqKlLyTyW/2/eGl4awVFB2feCh9W2fCFAHBlxLeIJH/YBcd3lJVsnD5pQ9kxAiIaAwwVgf9rS+AgMgGjd4PbNI70Gm64Onu7TnjdftfLzvjGID/AauhTKBuPeKdfMYJht5svrsKdIXvg5CPgUTlA92CCnAOLYDmc/zItXL3e2Zn9uvvdjfehf8Dfy95dYakYEnd6OjCnykPrzXh+swbBmvDTrAmSEH74zrAVREYMU9Em68fq22xOF/8Y/NoD3wHHKp+deivhrzbFmZsPCbRP87O2yMIzj/msuwAnEQjobjjl1vbLx345fGhVvih0Fm76Kmejzcd+v3qfQvhodP9Q+A/+Ta3IJfwIVsAAAAASUVORK5CYII='
      }
    />
  );
};
