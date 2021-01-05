declare enum KeyCodes {
    Tab = 9,
    Esc = 27,
    Enter = 13,
    Up = 38,
    Down = 40
}
declare enum InstancesSort {
    DisplayName = "DisplayName",
    Rank = "Rank"
}
declare enum HierarchiesExpand {
    UntilChildren = "UntilChildren",
    OneLevel = "OneLevel"
}
declare enum HierarchiesSort {
    Name = "Name",
    CumulativeInstanceCount = "CumulativeInstanceCount"
}
declare enum MetadataPropertyTypes {
    Double = "Double",
    String = "String",
    DateTime = "DateTime",
    Long = "Long"
}
declare enum ShiftTypes {
    startAt = "Start at",
    shifted = "shifted"
}
declare enum InterpolationFunctions {
    None = "",
    CurveLinear = "curveLinear",
    CurveStep = "curveStep",
    CurveStepBefore = "curveStepBefore",
    CurveStepAfter = "curveStepAfter",
    CurveBasis = "curveBasis",
    CurveCardinal = "curveCardinal",
    CurveMonotoneX = "curveMonotoneX",
    CurveCatmullRom = "curveCatmullRom"
}
declare enum ErrorCodes {
    InvalidInput = "InvalidInput",
    PartialSuccess = "PartialSuccess"
}
export { KeyCodes, InstancesSort, HierarchiesExpand, HierarchiesSort, MetadataPropertyTypes, ShiftTypes, InterpolationFunctions, ErrorCodes };
