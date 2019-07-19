export enum Size {
    Cube = 1,
    S_radius = 1,
    S_widthSegments = 32,
    S_heightSegments = 32,
    Co_radius = 1,
    Co_height = 2,
    Co_radialSegments = 32,
    Cy_radiusTop = 1,
    Cy_radiusBottom = 1,
    Cy_height = 5,
    Cy_radialSegments = 32,
    Pyramide = 3,
}

export enum Index {
    zero = 0,
    one,
    two,
    three,
    four,
    five,
    six,
    seven,
    height,
    nine,
    ten,
    eleven,
    twelve,
    thirteen,
    fourteen,
}

export enum Constant {
    nbTexture = 1,
    NbChoice = 4,
    MinSizeFactor = 1,
    MaxSizeFactor = 1.5,
}

export enum ModifType {
    addObject = 0,
    deleteObject,
    color,
    texture,
}

export enum ConstCamera {
    cameraZ = 5,
    fieldOfView = 75,
    nearClippingPane = 0.1,
    farClippingPane = 1000,
}

export enum Color {
    White = 0xFFFFFF,
    SceneGeoColor = 0xEDE7F6,
    DarkGray = 0x444444,
    SceneThemColor = 0x87CEEB,
}

export enum Light {
    Light_y = 1000,
    Dir_x = -3000,
    Dir_y = 1000,
    Dir_z = -1000,
    Dir_intensity = 1.4,
}

export enum Key {
    up = 38,
    w = 87,
    left = 37,
    a = 65,
    down = 40,
    s = 83,
    right = 39,
    d = 68,
}

export enum MaterialColor {
    Red = 0xF44336,
    Pink = 0xE91E63,
    Purple = 0xC27B0,
    DeepPurple = 0x673AB7,
    Indigo = 0x3F51B5,
    Blue = 0x2196F3,
    LightBlue = 0x03A9F4,
    Cyan = 0x00BCD4,
    Teal = 0x009688,
    Green = 0x4CAF50,
    LightGreen = 0x8BC34A,
    Lime = 0xCDDC39,
    Yellow = 0xFFEB3B,
    Amber = 0xFFC107,
    Orange = 0xFF9800,
    Brown = 0x795548,
    Grey = 0x9E9E9E,
    BlueGrey = 0x607D8B,
}

export enum GeometricBounds {
    xMin = -50,
    xMax = 50,
    yMin = -50,
    yMax = 50,
    zMin = -50,
    zMax = 50,
}

export enum ThematicBounds {
    xMin = 0,
    xMax = 200,
    yMin = 2,
    yMax = 200,
    zMin = 0,
    zMax = 200,
}
