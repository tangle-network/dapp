import * as d3 from 'd3';

type AnySelection = d3.Selection<any, any, any, any>;

type AttrParams = { [x: string]: any }

export const mapAttr = (section: AnySelection, attr: AttrParams): AnySelection => {
  Object.keys(attr).forEach((key: string): void => {
    section.attr(key, attr[key]);
  });

  return section;
};

export const clear = (_d: AnySelection): void => {
  _d.selectAll('*').remove();
};

export interface BulletBarConfigItem {
  label: string;
  labelStatus?: string;
  data: number;
  color: string;
  dataTransfer?: (data: number) => string;
}

export const drawBulletBar = ($container: HTMLElement, config: BulletBarConfigItem[]): void => {
  const _c = d3.select($container);
  const canvasHeight = 42;

  // clear
  clear(_c);

  // create d3 canvas
  const canvas = mapAttr(_c.append('svg'), {
    fill: 'transparent',
    height: canvasHeight,
    width: '100%'
  });

  // draw background
  const background = mapAttr(canvas.append('rect'), {
    fill: 'transparent',
    height: '100%',
    width: '100%'
  });

  // measure canvas size
  const canvasBox = background.node().getBBox();

  // initiazlie d3 scale
  const MAX_NUM = 10 ** 9;
  const _maxInputNum = Math.min(Math.max.apply(undefined, config.map((item: BulletBarConfigItem): number => item.data)) || 0, MAX_NUM);

  const scale = d3.scaleLinear().domain([0, _maxInputNum * 1.5]).range([0, canvasBox.width]);
  const minBarWidth = 6;

  // draw bar
  const _sortedConfig = config.slice().sort((a: BulletBarConfigItem, b: BulletBarConfigItem): number => b.data - a.data);
  const barMaxWidth = canvasBox.width;
  const barHeight = 6;
  const barX = 0;
  const barY = 36;

  const getBarWidth = (data: number): number => {
    if (data === Infinity) {
      return barMaxWidth;
    }

    if (Number.isNaN(data)) {
      return 0;
    }

    return scale(data) || 0;
  };

  mapAttr(canvas.append('rect'), {
    fill: '#ffffff',
    height: barHeight,
    rx: barHeight / 2,
    ry: barHeight / 2,
    width: barMaxWidth,
    x: barX,
    y: barY
  });

  _sortedConfig.forEach((item: BulletBarConfigItem): void => {
    mapAttr(canvas.append('rect'), {
      fill: item.color,
      height: barHeight,
      rx: barHeight / 2,
      ry: barHeight / 2,
      width: getBarWidth(item.data),
      x: barX,
      y: barY
    });
    mapAttr(canvas.append('rect'), {
      fill: item.color,
      height: barHeight,
      width: barHeight,
      x: Math.max(getBarWidth(item.data) - barHeight + barX, 0),
      y: barY
    });
  });

  // draw text
  _sortedConfig.map((item: BulletBarConfigItem, index: number): AnySelection => {
    return mapAttr(canvas.append('text'), {
      fill: item.color,
      'font-size': 20,
      'font-weight': 'bold',
      id: `text-${index}`,
      'text-anchor': 'middle',
      x: getBarWidth(item.data) + barX,
      y: 20
    }).text(item.dataTransfer ? item.dataTransfer(item.data) : item.data);
  });

  // adjust text position
  _sortedConfig.forEach((item: BulletBarConfigItem, index: number): void => {
    const current = canvas.select<SVGTextElement>(`#text-${index}`);
    const next = canvas.select<SVGTextElement>(`#text-${index + 1}`);
    const currentNode = current.node();
    const nextNode = next.node();

    if (!currentNode) return;

    const currentBox = currentNode.getBBox();

    if (currentBox.x <= 0) {
      current.attr('x', currentBox.width / 2);

      return;
    }

    if (canvasBox.width - currentBox.x - currentBox.width / 2 <= 0) {
      current.attr('x', canvasBox.width - currentBox.width / 2);

      return;
    }

    // adjust edge

    if (!nextNode) return;
    const nextBox = nextNode.getBBox();

    // adjust overlap
    if (currentBox.x < (nextBox.x + nextBox.width)) {
      next.attr('x', currentBox.x - nextBox.width / 2 - 10);
    }
  });

  // draw polyline
  _sortedConfig.forEach((item: BulletBarConfigItem, index: number): void => {
    const text = canvas.select<SVGTextElement>(`#text-${index}`);
    const textNode = text.node();

    if (!textNode) return;

    const textBox = textNode.getBBox();
    const barX2 = barX + getBarWidth(item.data);
    const pointAtBarEndX = Math.max(barX2 - 0.5, minBarWidth);
    let points = [];

    if (index === 0 || textBox.x + textBox.width - barX2 > 0) {
      points = [
        pointAtBarEndX, barY - barHeight, // point 3
        pointAtBarEndX, barY // point 4
      ];
    } else {
      points = [
        textBox.x, textBox.y + textBox.height, // point 1
        textBox.x + textBox.width, textBox.y + textBox.height, // point 2
        pointAtBarEndX, barY - barHeight, // point 3
        pointAtBarEndX, barY // point 4
      ];
    }

    mapAttr(canvas.append('polyline'), {
      fill: 'none',
      points: points,
      'stoke-width': 1,
      stroke: item.color
    });
  });
};
