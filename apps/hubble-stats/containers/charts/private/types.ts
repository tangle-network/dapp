import {
  FormattedBasicChartDataType,
  FormattedVolumeChartDataType,
} from '../../../types';

export interface BasicChartContainerProps {
  defaultValue?: number;
  data: FormattedBasicChartDataType;
}

export interface AreaChartContainerProps extends BasicChartContainerProps {}
export interface BarChartContainerProps extends BasicChartContainerProps {}

export interface VolumeChartContainerProps {
  deposit24h?: number;
  data: FormattedVolumeChartDataType;
}
