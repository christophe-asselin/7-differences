import { ISimpleGame } from "./ISimpleGame";
import { IFreeGame } from "./IFreeGame";
import { GameType, GameState } from "./GameEnum";
import { Game3DType } from "./Game3DType";

export const SIMPLEGAMES: ISimpleGame[] = [
  {
    _id: "0",
    name: "Nuit",
    type: GameType.SIMPLE,
    originalImageURL: "",
    modifiedImageURL: "",
    differenceRegions: [],
    scoreSolo: [
      { time: "08:33", name: "Jason"},
      { time: "08:32", name: "Matthiew" },
      { time: "06:03", name: "Suzanne" },
    ],
    scoreDuo: [
      { time: "40:00", name: "Chris" },
      { time: "30:00", name: "Greg" },
      { time: "10:00", name: "Ouss" },
    ],
    state: GameState.NOT_WAITING,
  },
  {
    _id: "1",
    name: "Temp",
    type: GameType.SIMPLE,
    originalImageURL: "",
    modifiedImageURL: "",
    differenceRegions: [],
    scoreSolo: [
      { time: "09:11", name: "Zoe" },
      { time: "00:45", name: "Juliette" },
      { time: "01:46", name: "Théo" },
    ],
    scoreDuo: [
      { time: "11:00", name: "Killian" },
      { time: "06:19", name: "Jonathan" },
      { time: "00:45", name: "Cédric" },
    ],
    state: GameState.NOT_WAITING,
  },
];

export const FREEGAMES: IFreeGame[] = [
  {
    _id: "2",
    name: "Vue Libre",
    type: GameType.FREE,
    game3Dtype: Game3DType.GEOMETRIC,
    // Mock Image
    // tslint:disable-next-line:max-line-length
    originalImageURL: "http://209.29.243.193/TCGTest/wap2/image/ImageTestContent/BMP/Standard%20Test%20(8%20Bit_256%20Color)/RLE%20Compression%20(Standard%20Test)/640x480%20and%20480x640/640x480/Size_100k_200k/M_BMP640X480_170K.bmp",
    scoreSolo: [
      { time: "20:05", name: "Karl" },
      { time: "10:11", name: "Jasper" },
      { time: "28:03", name: "Carlos" },
    ],
    scoreDuo: [
      { time: "38:45", name: "Naomie" },
      { time: "15:00", name: "Charline" },
      { time: "13:02", name: "Catherine" },
    ],
    originalObjects: [],
    modifiedObjects: [],
    state: GameState.NOT_WAITING,
  },
  {
    _id: "3",
    name: "Vue Libre 2",
    type: GameType.FREE,
    game3Dtype: Game3DType.GEOMETRIC,
    // Mock Image
    // tslint:disable-next-line:max-line-length
    originalImageURL: "http://209.29.243.193/TCGTest/wap2/image/ImageTestContent/BMP/Standard%20Test%20(8%20Bit_256%20Color)/RLE%20Compression%20(Standard%20Test)/640x480%20and%20480x640/640x480/Size_100k_200k/M_BMP640X480_170K.bmp",
    scoreSolo: [
      { time: "17:22", name: "Sabrina" },
      { time: "12:45", name: "Paul" },
      { time: "06:42", name: "Jade" },
    ],
    scoreDuo: [
      { time: "02:00", name: "Yoanne" },
      { time: "09:19", name: "Martin" },
      { time: "22:45", name: "Jasmine" },
    ],
    originalObjects: [],
    modifiedObjects: [],
    state: GameState.NOT_WAITING,
  },
];
