import React, {Component} from "react";
import {Defs, Line, LinearGradient, Stop, Text} from "react-native-svg";

import {ChartConfig, Dataset, PartialBy} from "./HelperTypes";

export interface AbstractChartProps {
  fromZero?: boolean;
  fromNumber?: number;
  maxNumber?: number;
  minNumber?: number;
  chartConfig?: AbstractChartConfig;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  yLabelsOffset?: number;
  yAxisInterval?: number;
  xAxisLabel?: string;
  xLabelsOffset?: number;
  hidePointsAtIndex?: number[];
}

export interface AbstractChartConfig extends ChartConfig {
  count?: number;
  data?: Dataset[];
  width?: number;
  height?: number;
  paddingTop?: number;
  paddingRight?: number;
  horizontalLabelRotation?: number;
  formatYLabel?: (yLabel: string) => string;
  labels?: string[];
  horizontalOffset?: number;
  stackedBar?: boolean;
  verticalLabelRotation?: number;
  formatXLabel?: (xLabel: string) => string;
  verticalLabelsHeightPercentage?: number;
  formatTopBarValue?: (topBarValue: number) => string | number;
}

export type AbstractChartState = {};

export const DEFAULT_X_LABELS_HEIGHT_PERCENTAGE = 0.75;

class AbstractChart<
  IProps extends AbstractChartProps,
  IState extends AbstractChartState
> extends Component<AbstractChartProps & IProps, AbstractChartState & IState> {
  calcScaler = (data: number[]) => {
    if (this.props.fromZero && this.props.fromNumber) {
      return Math.max(...data, this.props.fromNumber) - Math.min(...data, 0) || 1;
    } else if (this.props.fromZero) {
      return Math.max(...data, 0) - Math.min(...data, 0) || 1;
    } else if (this.props.fromNumber) {
      return (
        Math.max(...data, this.props.fromNumber) -
          Math.min(...data, this.props.fromNumber) || 1
      );
    } else {
      if (this.props.minNumber !== undefined && this.props.maxNumber !== undefined)
        return this.props.maxNumber - this.props.minNumber || 1;

      return Math.max(...data) - Math.min(...data) || 1;
    }
  };

  calcBaseHeight = (data: number[], height: number) => {
    const min = this.props.minNumber !== undefined ? this.props.minNumber : Math.min(...data);
    const max = this.props.maxNumber !== undefined ? this.props.maxNumber : Math.max(...data);
    if (min >= 0 && max >= 0) {
      return height;
    } else if (min < 0 && max <= 0) {
      return 0;
    } else if (min < 0 && max > 0) {
      return (height * max) / this.calcScaler(data);
    }
  };

  calcHeight = (val: number, data: number[], height: number) => {
    const min = this.props.minNumber !== undefined ? this.props.minNumber : Math.min(...data);
    const max = this.props.maxNumber !== undefined ? this.props.maxNumber : Math.max(...data);

    if (min < 0 && max > 0) {
      return height * (val / this.calcScaler(data));
    } else if (min >= 0 && max >= 0) {
      return this.props.fromZero
        ? height * (val / this.calcScaler(data))
        : height * ((val - min) / this.calcScaler(data));
    } else if (min < 0 && max <= 0) {
      return this.props.fromZero
        ? height * (val / this.calcScaler(data))
        : height * ((val - max) / this.calcScaler(data));
    }
  };

  getPropsForBackgroundLines() {
    const { propsForBackgroundLines = {} } = this.props.chartConfig;
    return {
      stroke: "#C4C4C4",
      opacity: 0.25,
      strokeWidth: 1,
      ...propsForBackgroundLines
    };
  }

  getPropsForLabels() {
    const {
      propsForLabels = {},
      textColor,
    } = this.props.chartConfig;
    return {
      fontSize: 12,
      fill: textColor,
      ...propsForLabels
    };
  }

  getPropsForVerticalLabels() {
    const {
      propsForVerticalLabels = {},
      color,
      labelColor = color
    } = this.props.chartConfig;
    return {
      fill: labelColor(0.8),
      ...propsForVerticalLabels
    };
  }

  getPropsForHorizontalLabels() {
    const {
      propsForHorizontalLabels = {},
      color,
      labelColor = color
    } = this.props.chartConfig;
    return {
      fill: labelColor(0.8),
      ...propsForHorizontalLabels
    };
  }

  renderHorizontalLines = (
      config: Omit<AbstractChartConfig, "data"> & { data: number[] },
      minNumber?: number,
      maxNumber?: number,
      iOfZero?: number,
  ) => {
    const {
      count,
      width,
      height,
      paddingTop,
      paddingRight,
      verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE
    } = config;
    const basePosition = height * verticalLabelsHeightPercentage;

    let zeroLine = false;

    const lines = [...new Array(count + 1)].map((_, i) => {
      const y = (basePosition / count) * i + paddingTop;

      if (i === iOfZero) zeroLine = true;

      return (
          <Line
              key={Math.random()}
              x1={paddingRight}
              y1={y}
              x2={width}
              y2={y}
              {...this.getPropsForBackgroundLines()}
          />
      );
    });

    //console.log("zeroline: " + iOfZero)

    // Add 0 line if within range
    // TODO this doesnt always work, the line says even though it shouldnt, when min is -2,
    //  and max is 2, segments is 3, it divides by 0
    if (minNumber < 0 && maxNumber > 0) {
      //const y = (basePosition / count) * 1.5 + paddingTop;
      const y = (basePosition / count) * (count - iOfZero) + paddingTop;
      lines.push(
          <Line
              key={Math.random()}
              x1={paddingRight}
              y1={y}
              x2={width}
              y2={y}
              {...this.getPropsForBackgroundLines()}
          />
      );
    }

    return lines;
  };

  renderHorizontalLine = config => {
    const {
      width,
      height,
      paddingTop,
      paddingRight,
      verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE
    } = config;
    return (
      <Line
        key={Math.random()}
        x1={paddingRight}
        y1={height * verticalLabelsHeightPercentage + paddingTop}
        x2={width}
        y2={height * verticalLabelsHeightPercentage + paddingTop}
        {...this.getPropsForBackgroundLines()}
      />
    );
  };

  renderHorizontalLabels = (
    config: Omit<AbstractChartConfig, "data"> & { data: number[] },
    minNumber?: number,
    maxNumber?: number,
    findIOfZero?: boolean
  ) => {
    const {
      count,
      data,
      height,
      paddingTop,
      paddingRight,
      horizontalLabelRotation = 0,
      decimalPlaces = 2,
      formatYLabel = (yLabel: string) => yLabel,
      verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE
    } = config;

    let {
      yAxisLabel = "",
      yAxisSuffix = "",
      yLabelsOffset = 5
    } = this.props;

    let iOfZero = -1;

    const labels = new Array(count === 1 ? 1 : count + 1).fill(1).map((_, i) => {
      let yLabel = String(i * count);

      if (count === 1) {
        yLabel = `${yAxisLabel}${formatYLabel(
          data[0].toFixed(decimalPlaces)
        )}${yAxisSuffix}`;
      } else {
        let label = this.props.fromZero
          ? ((this.calcScaler(data) / count) * i) + (minNumber !== undefined ? minNumber : Math.min(...data, 0))
          : ((this.calcScaler(data) / count) * i) + (minNumber !== undefined ? minNumber : Math.min(...data));

        //console.log("scalar:" + (this.calcScaler(data) / count))
        //console.log("min: " + (minNumber !== undefined ? minNumber : Math.min(...data)))

        label = Math.round(label)

        yLabel = `${yAxisLabel}${formatYLabel(
            label.toFixed(decimalPlaces)
        )}${yAxisSuffix}`;
      }

      const basePosition = height * verticalLabelsHeightPercentage;
      const x = paddingRight - yLabelsOffset;
      const y =
        count === 1 && this.props.fromZero
          ? paddingTop + 4
          : height * verticalLabelsHeightPercentage -
            (basePosition / count) * i +
            paddingTop;
      return (
        <Text
          rotation={horizontalLabelRotation}
          origin={`${x}, ${y}`}
          key={Math.random()}
          x={x}
          textAnchor="end"
          y={y}
          {...this.getPropsForLabels()}
          {...this.getPropsForHorizontalLabels()}
        >
          {yLabel}
        </Text>
      );
    });

    const mapToHeight = () => {
      return ((0 - minNumber) / (maxNumber - minNumber)) * (height * verticalLabelsHeightPercentage);
    }

    if (!findIOfZero) return labels;
    if (minNumber > 0 || maxNumber < 0) return {horizontalLabels: labels, iOfZero: -1}

    iOfZero = -(minNumber !== undefined ? minNumber : Math.min(...data)) / (this.calcScaler(data) / count);

    if (iOfZero % 1 !== 0) {
      const x = paddingRight - yLabelsOffset;
      const y = (height * verticalLabelsHeightPercentage) -
          mapToHeight() +
          paddingTop;
      labels.push(
          <Text
              rotation={horizontalLabelRotation}
              origin={`${x}, ${y}`}
              key={Math.random()}
              x={x}
              textAnchor="end"
              y={y}
              {...this.getPropsForLabels()}
              {...this.getPropsForHorizontalLabels()}
          >
            {`${yAxisLabel}${formatYLabel("0")}${yAxisSuffix}`}
          </Text>
      );
    }

    return {horizontalLabels: labels, iOfZero};
  };

  renderVerticalLabels = ({
    labels = [],
    width,
    height,
    paddingRight,
    paddingTop,
    horizontalOffset = 0,
    stackedBar = false,
    verticalLabelRotation = 0,
    formatXLabel = xLabel => xLabel,
    verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE,
  }: Pick<
    AbstractChartConfig,
    | "labels"
    | "width"
    | "height"
    | "paddingRight"
    | "paddingTop"
    | "horizontalOffset"
    | "stackedBar"
    | "verticalLabelRotation"
    | "formatXLabel"
    | "verticalLabelsHeightPercentage"
  >, yAxisTextOffset = 0) => {
    const {
      xAxisLabel = "",
      xLabelsOffset = 0,
      hidePointsAtIndex = []
    } = this.props;

    const fontSize = 12;

    let fac = 1;
    if (stackedBar) {
      fac = 0.71;
    }

    return labels.map((label, i) => {
      if (hidePointsAtIndex.includes(i)) {
        return null;
      }

      const x =
        ((((width-20-yAxisTextOffset) - paddingRight) / (labels.length-1)) * i +
          paddingRight +
          horizontalOffset) *
        fac;

      const y =
        height * verticalLabelsHeightPercentage +
        paddingTop +
        fontSize * 2 +
        xLabelsOffset;

      return (
        <Text
          origin={`${x}, ${y}`}
          rotation={verticalLabelRotation}
          key={Math.random()}
          x={x}
          y={y}
          textAnchor={verticalLabelRotation === 0 ? "middle" : "start"}
          {...this.getPropsForLabels()}
          {...this.getPropsForVerticalLabels()}
        >
          {`${formatXLabel(label)}${xAxisLabel}`}
        </Text>
      );
    });
  };

  renderVerticalLines = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE
  }: Omit<
    Pick<
      AbstractChartConfig,
      | "data"
      | "width"
      | "height"
      | "paddingRight"
      | "paddingTop"
      | "verticalLabelsHeightPercentage"
    >,
    "data"
  > & { data: number[] }) => {
    const { yAxisInterval = 1 } = this.props;

    return [...new Array(Math.ceil(data.length / yAxisInterval))].map(
      (_, i) => {
        return (
          <Line
            key={Math.random()}
            x1={Math.floor(
              (((width-20) - paddingRight - (i === data.length-1 ? 0 : 0)) / ((data.length-1) / yAxisInterval)) * (i) +
                paddingRight
            )}
            y1={0}
            x2={Math.floor(
              (((width-20) - paddingRight - (i === data.length-1 ? 0 : 0)) / ((data.length-1) / yAxisInterval)) * i +
                paddingRight
            )}
            y2={height * verticalLabelsHeightPercentage + paddingTop}
            {...this.getPropsForBackgroundLines()}
          />
        );
      }
    );
  };

  renderVerticalLine = ({
    height,
    paddingTop,
    paddingRight,
    verticalLabelsHeightPercentage = DEFAULT_X_LABELS_HEIGHT_PERCENTAGE
  }: Pick<
    AbstractChartConfig,
    "height" | "paddingRight" | "paddingTop" | "verticalLabelsHeightPercentage"
  >) => (
    <Line
      key={Math.random()}
      x1={Math.floor(paddingRight)}
      y1={0}
      x2={Math.floor(paddingRight)}
      y2={height * verticalLabelsHeightPercentage + paddingTop}
      {...this.getPropsForBackgroundLines()}
    />
  );

  renderDefs = (
    config: Pick<
      PartialBy<
        AbstractChartConfig,
        | "backgroundGradientFromOpacity"
        | "backgroundGradientToOpacity"
        | "fillShadowGradient"
        | "fillShadowGradientOpacity"
        | "fillShadowGradientFrom"
        | "fillShadowGradientFromOpacity"
        | "fillShadowGradientFromOffset"
        | "fillShadowGradientTo"
        | "fillShadowGradientToOpacity"
        | "fillShadowGradientToOffset"
      >,
      | "width"
      | "height"
      | "backgroundGradientFrom"
      | "backgroundGradientTo"
      | "useShadowColorFromDataset"
      | "data"
      | "backgroundGradientFromOpacity"
      | "backgroundGradientToOpacity"
      | "fillShadowGradient"
      | "fillShadowGradientOpacity"
      | "fillShadowGradientFrom"
      | "fillShadowGradientFromOpacity"
      | "fillShadowGradientFromOffset"
      | "fillShadowGradientTo"
      | "fillShadowGradientToOpacity"
      | "fillShadowGradientToOffset"
    >
  ) => {
    const {
      width,
      height,
      backgroundGradientFrom,
      backgroundGradientTo,
      useShadowColorFromDataset,
      data
    } = config;

    const fromOpacity = config.hasOwnProperty("backgroundGradientFromOpacity")
      ? config.backgroundGradientFromOpacity
      : 1.0;
    const toOpacity = config.hasOwnProperty("backgroundGradientToOpacity")
      ? config.backgroundGradientToOpacity
      : 1.0;

    const fillShadowGradient = config.hasOwnProperty("fillShadowGradient")
      ? config.fillShadowGradient
      : this.props.chartConfig.color(1.0);

    const fillShadowGradientOpacity = config.hasOwnProperty(
      "fillShadowGradientOpacity"
    )
      ? config.fillShadowGradientOpacity
      : 0.1;

    const fillShadowGradientFrom = config.hasOwnProperty(
      "fillShadowGradientFrom"
    )
      ? config.fillShadowGradientFrom
      : fillShadowGradient;

    const fillShadowGradientFromOpacity = config.hasOwnProperty(
      "fillShadowGradientFromOpacity"
    )
      ? config.fillShadowGradientFromOpacity
      : fillShadowGradientOpacity;

    const fillShadowGradientFromOffset = config.hasOwnProperty(
      "fillShadowGradientFromOffset"
    )
      ? config.fillShadowGradientFromOffset
      : 0;

    const fillShadowGradientTo = config.hasOwnProperty("fillShadowGradientTo")
      ? config.fillShadowGradientTo
      : this.props.chartConfig.color(1.0);

    const fillShadowGradientToOpacity = config.hasOwnProperty(
      "fillShadowGradientToOpacity"
    )
      ? config.fillShadowGradientToOpacity
      : 0.1;

    const fillShadowGradientToOffset = config.hasOwnProperty(
      "fillShadowGradientToOffset"
    )
      ? config.fillShadowGradientToOffset
      : 1;

    return (
      <Defs>
        <LinearGradient
          id="backgroundGradient"
          x1={0}
          y1={height}
          x2={width}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop
            offset="0"
            stopColor={backgroundGradientFrom}
            stopOpacity={fromOpacity}
          />
          <Stop
            offset="1"
            stopColor={backgroundGradientTo}
            stopOpacity={toOpacity}
          />
        </LinearGradient>
        {useShadowColorFromDataset ? (
          data.map((dataset, index) => (
            <LinearGradient
              id={`fillShadowGradientFrom_${index}`}
              key={`${index}`}
              x1={0}
              y1={0}
              x2={0}
              y2={height}
              gradientUnits="userSpaceOnUse"
            >
              <Stop
                offset={fillShadowGradientFromOffset}
                stopColor={
                  dataset.color ? dataset.color(1.0) : fillShadowGradientFrom
                }
                stopOpacity={fillShadowGradientFromOpacity}
              />
              <Stop
                offset={fillShadowGradientToOffset}
                stopColor={
                  dataset.color
                    ? dataset.color(fillShadowGradientFromOpacity)
                    : fillShadowGradientFrom
                }
                stopOpacity={fillShadowGradientToOpacity || 0}
              />
            </LinearGradient>
          ))
        ) : (
          <LinearGradient
            id="fillShadowGradientFrom"
            x1={0}
            y1={0}
            x2={0}
            y2={height}
            gradientUnits="userSpaceOnUse"
          >
            <Stop
              offset={fillShadowGradientFromOffset}
              stopColor={fillShadowGradientFrom}
              stopOpacity={fillShadowGradientFromOpacity}
            />
            <Stop
              offset={fillShadowGradientToOffset}
              stopColor={fillShadowGradientTo || fillShadowGradientFrom}
              stopOpacity={fillShadowGradientToOpacity || 0}
            />
          </LinearGradient>
        )}
      </Defs>
    );
  };
}

export default AbstractChart;
