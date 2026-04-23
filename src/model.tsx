export interface ErrorDto {
    message: string;
}

export interface TimeDto {
    hour: number;
    minute: number;
}

export interface BlackoutWindowDto {
    start: TimeDto;
    end: TimeDto;
    override: boolean;
}

export interface ColorDto {
    r: number;
    g: number;
    b: number;
}

export interface ColorsDto {
    fgDefault: ColorDto;
    fgPunctual: ColorDto;
    fgLate: ColorDto;
    fgTraffic: ColorDto;
}

export interface ConfigurationDto {
    mode: 0 | 1;
    brightness: number;
    blackoutWindow: BlackoutWindowDto;
    colors: ColorsDto;
}
