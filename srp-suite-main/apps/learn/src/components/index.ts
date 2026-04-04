/**
 * Components for Remotion Video Generation
 * Apple-inspired design system
 */

// Video clip components
export { AIVideoClip } from './AIVideoClip';
export { ManimClip } from './ManimClip';

// Visual components
export { SVGPathDraw, DECORATIVE_PATHS } from './SVGPathDraw';

// Layout components
export {
    FlowDiagram,
    FLOW_LOTO,
    FLOW_MAINTENANCE,
    FLOW_EPP,
    type FlowNode,
    type FlowConnection,
    type FlowDiagramProps,
} from './FlowDiagram';

export {
    BentoGrid,
    BentoStatCard,
    BentoTextCard,
    BentoIconList,
    createSafetyStatsBento,
    createEPPBento,
    type BentoItem,
    type BentoSize,
    type BentoGridProps,
} from './BentoGrid';

// Icon components
export {
    AnimatedIcon,
    IconRow,
    IconGrid,
    EPP_ICONS,
    SAFETY_ICONS,
    TOOL_ICONS,
    type IconAnimation,
    type AnimatedIconProps,
    type IconRowProps,
    type IconGridProps,
} from './AnimatedIcon';

// Slide components
export {
    ContentSlide,
    type SlideLayout,
    type ContentSlideProps,
} from './ContentSlide';
