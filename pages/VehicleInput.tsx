
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface CarVersion {
    name: string;
    start?: number;
    end?: number;
}

const carData: Record<string, Record<string, (string | CarVersion)[]>> = {
  "Audi": {
    "A1": [{ name: "1.4 TFSI Attraction", start: 2011, end: 2018 }, { name: "1.4 TFSI Ambition", start: 2011, end: 2015 }, { name: "1.8 TFSI Ambition", start: 2016, end: 2018 }],
    "A3": [{ name: "1.8 Turbo (G1)", start: 1997, end: 2006 }, { name: "1.6 8v (G1)", start: 1999, end: 2006 }, { name: "Sportback 2.0 TFSI", start: 2007, end: 2012 }, { name: "Sedan 1.4 TFSI Flex", start: 2014 }, { name: "Sedan 2.0 TFSI Performance", start: 2018 }, { name: "S3 Quattro", start: 2014 }, { name: "Performance Black 2.0", start: 2021 }],
    "A4": [{ name: "2.0 TFSI Ambiente", start: 2009, end: 2015 }, { name: "Prestige Plus 2.0", start: 2016 }, { name: "Performance Black", start: 2021 }],
    "Q3": [{ name: "2.0 TFSI Ambition", start: 2012, end: 2018 }, { name: "1.4 TFSI Flex", start: 2016, end: 2018 }, { name: "Black Edition 2.0", start: 2020 }, { name: "Sportback Performance", start: 2022 }],
    "Q5": [{ name: "2.0 TFSI Ambition", start: 2009, end: 2017 }, { name: "TFSIe Hybrid", start: 2022 }],
    "TT": [{ name: "2.0 TFSI Coupe", start: 2007, end: 2014 }, { name: "RS 2.5 Turbo", start: 2018 }]
  },
  "BMW": {
    "Série 1": [{ name: "118i (E87)", start: 2005, end: 2011 }, { name: "120i (E87)", start: 2005, end: 2011 }, { name: "125i M Sport", start: 2013, end: 2017 }, { name: "120i Sport (F20)", start: 2015, end: 2019 }, { name: "118i M Sport (F40)", start: 2020 }],
    "Série 3": [{ name: "320i (E46)", start: 1998, end: 2005 }, { name: "320i (E90)", start: 2006, end: 2012 }, { name: "320i Sport GP (F30)", start: 2013, end: 2018 }, { name: "328i Flex", start: 2014, end: 2018 }, { name: "320i M Sport (G20)", start: 2019 }, { name: "330e Hybrid", start: 2020 }],
    "X1": [{ name: "sDrive18i (E84)", start: 2010, end: 2015 }, { name: "sDrive20i Flex (F48)", start: 2016, end: 2022 }, { name: "sDrive18i GP (U11)", start: 2023 }],
    "X5": [{ name: "xDrive45e Hybrid", start: 2020 }, { name: "xDrive50e M Sport", start: 2024 }]
  },
  "BYD": {
    "Dolphin": [{ name: "EV 95cv", start: 2023 }, { name: "Plus 204cv", start: 2024 }, { name: "Mini EV", start: 2024 }],
    "Song Plus": [{ name: "DM-i Hybrid", start: 2023 }],
    "Seal": [{ name: "EV AWD 530cv", start: 2024 }],
    "Yuan Plus": [{ name: "EV 204cv", start: 2023 }],
    "Tan": [{ name: "EV 4WD", start: 2022 }],
    "Han": [{ name: "EV Performance", start: 2022 }]
  },
  "Chevrolet": {
    "Corsa": [
      { name: "Wind 1.0 (G1)", start: 1994, end: 2002 },
      { name: "Super 1.0/1.6 (G1)", start: 1996, end: 2002 },
      { name: "GL 1.6 (G1)", start: 1996, end: 2001 },
      { name: "Hatch Joy 1.0 (G2)", start: 2003, end: 2009 },
      { name: "Hatch Maxx 1.4/1.8 (G2)", start: 2003, end: 2012 },
      { name: "Hatch Premium 1.4 (G2)", start: 2008, end: 2012 },
      { name: "Sedan Joy 1.0", start: 2003, end: 2007 },
      { name: "Sedan Premium 1.8", start: 2003, end: 2009 },
      { name: "Classic LS", start: 2010, end: 2016 }
    ],
    "Onix": [
      { name: "LT 1.0 (G1)", start: 2012, end: 2019 },
      { name: "LTZ 1.4 (G1)", start: 2012, end: 2019 },
      { name: "Joy 1.0", start: 2016, end: 2021 },
      { name: "LT Turbo (G2)", start: 2020 },
      { name: "Premier Turbo (G2)", start: 2020 },
      { name: "RS Turbo", start: 2021 },
      { name: "Plus Sedan Premier", start: 2020 }
    ],
    "Celta": [
      { name: "Spirit 1.0", start: 2001, end: 2006 },
      { name: "Life 1.0", start: 2005, end: 2011 },
      { name: "LT 1.0 VHCE", start: 2012, end: 2015 },
      { name: "Advantage 1.0", start: 2014, end: 2015 }
    ],
    "Astra": [
      { name: "GL 1.8 (G2)", start: 1999, end: 2004 },
      { name: "Advantage 2.0 Flex", start: 2005, end: 2011 },
      { name: "Elite 2.0 AT", start: 2004, end: 2007 },
      { name: "GSI 2.0 16v", start: 2003, end: 2005 }
    ],
    "Vectra": [
      { name: "GLS 2.0 (G2)", start: 1996, end: 2001 },
      { name: "CD 2.2 16v (G2)", start: 1997, end: 2005 },
      { name: "Elite 2.4 (G3)", start: 2006, end: 2011 },
      { name: "GT-X Hatch", start: 2008, end: 2011 }
    ],
    "S10": [
      { name: "Colina 2.8 Diesel", start: 2005, end: 2011 },
      { name: "Executive 2.8 Diesel", start: 2005, end: 2011 },
      { name: "LTZ 2.8 CTDI (G2)", start: 2012, end: 2024 },
      { name: "High Country", start: 2016 },
      { name: "Z71 Turbo", start: 2022 },
      { name: "WT/Z71/High Country (Nova)", start: 2025 }
    ],
    "Tracker": [
      { name: "2.0 4x4 (G1)", start: 2001, end: 2004 },
      { name: "LTZ 1.4 Turbo (G2)", start: 2017, end: 2020 },
      { name: "Premier 1.2 Turbo (G3)", start: 2021 },
      { name: "RS Turbo", start: 2024 }
    ],
    "Cruze": [
      { name: "LTZ 1.8 (G1)", start: 2012, end: 2016 },
      { name: "LTZ 1.4 Turbo (G2)", start: 2017, end: 2023 },
      { name: "Sport6 RS Turbo", start: 2022, end: 2024 }
    ],
    "Montana": [
      { name: "Sport 1.8 (G1)", start: 2004, end: 2010 },
      { name: "LS 1.4 (G2)", start: 2011, end: 2021 },
      { name: "Premier Turbo (G3)", start: 2023 }
    ]
  },
  "Citroën": {
    "C3": [{ name: "Exclusive 1.6", start: 2003, end: 2012 }, { name: "Tendance 1.5", start: 2013, end: 2017 }, { name: "First Edition 1.0 (Novo)", start: 2023 }],
    "C4 Cactus": [{ name: "Feel 1.6 Flex", start: 2019 }, { name: "Shine Pack THP Turbo", start: 2019 }],
    "C4 Pallas": [{ name: "Exclusive 2.0", start: 2008, end: 2013 }],
    "Jumper": [{ name: "Furgão 35LH", start: 2010 }]
  },
  "Fiat": {
    "Uno": [
      { name: "Mille Fire/Way", start: 2002, end: 2013 },
      { name: "Vivace 1.0 (G2)", start: 2011, end: 2016 },
      { name: "Way 1.3 Firefly", start: 2017, end: 2021 },
      { name: "Ciao (Série Final)", start: 2021, end: 2021 }
    ],
    "Palio": [
      { name: "EDX 1.0 (G1)", start: 1996, end: 1999 },
      { name: "ELX 1.3 (G2)", start: 2001, end: 2003 },
      { name: "Fire Economy", start: 2010, end: 2016 },
      { name: "Attractive 1.0 (Novo)", start: 2012, end: 2017 }
    ],
    "Strada": [
      { name: "Working 1.4 (G1)", start: 2002, end: 2020 },
      { name: "Adventure 1.8 Locker", start: 2009, end: 2020 },
      { name: "Freedom 1.3 (G2)", start: 2021 },
      { name: "Volcano CVT", start: 2022 },
      { name: "Ultra/Ranch T200 Turbo", start: 2024 }
    ],
    "Toro": [
      { name: "Freedom 1.8 Flex", start: 2016, end: 2021 },
      { name: "Volcano Diesel 4x4", start: 2016 },
      { name: "Endurance T270 Turbo", start: 2022 },
      { name: "Ultra Diesel 4x4", start: 2020 }
    ],
    "Doblò": [
      { name: "Cargo 1.3 16v", start: 2002, end: 2006 },
      { name: "Adventure 1.8 (G1)", start: 2004, end: 2010 },
      { name: "Essence 1.8 Flex (G2)", start: 2011, end: 2021 },
      { name: "Adventure 1.8 E.torQ", start: 2011, end: 2021 }
    ],
    "Fiorino": [
      { name: "Furgão 1.5 i.e.", start: 1997, end: 2004 },
      { name: "Furgão Fire 1.3", start: 2003, end: 2013 },
      { name: "Evo 1.4 (G2)", start: 2014, end: 2021 },
      { name: "Endurance 1.4 (Facelift)", start: 2022 }
    ],
    "Ducato": [
      { name: "Combinato 2.8 Diesel", start: 2000, end: 2005 },
      { name: "Multi 2.3 Diesel", start: 2010, end: 2017 },
      { name: "Cargo 2.3", start: 2018, end: 2022 },
      { name: "Minibus Comfort", start: 2023 }
    ],
    "Pulse": [{ name: "Drive 1.3", start: 2022 }, { name: "Audace Turbo 200", start: 2022 }, { name: "Abarth T270", start: 2023 }],
    "Fastback": [{ name: "Audace T200", start: 2023 }, { name: "Limited Edition T270", start: 2023 }, { name: "Abarth T270", start: 2024 }],
    "Mobi": [{ name: "Like 1.0", start: 2017 }, { name: "Trekking", start: 2021 }],
    "Argo": [{ name: "Drive 1.0", start: 2018 }, { name: "Trekking 1.3", start: 2020 }, { name: "Precision AT6", start: 2018, end: 2020 }]
  },
  "Ford": {
    "Ka": [
      { name: "Image 1.0 (G1)", start: 1997, end: 2007 },
      { name: "XR 1.6 (G1)", start: 2001, end: 2007 },
      { name: "Class 1.0 (G2)", start: 2008, end: 2013 },
      { name: "SE 1.0 (G3)", start: 2015, end: 2021 },
      { name: "Titanium 1.5 AT", start: 2019, end: 2021 },
      { name: "Freestyle 1.5 AT", start: 2019, end: 2021 }
    ],
    "Fiesta": [
      { name: "Street 1.0", start: 2000, end: 2006 },
      { name: "Hatch Class 1.6 (Rocam)", start: 2005, end: 2014 },
      { name: "Sedan 1.6 Rocam", start: 2005, end: 2014 },
      { name: "New Fiesta Titanium AT", start: 2014, end: 2019 }
    ],
    "EcoSport": [
      { name: "XLS 1.6 (G1)", start: 2003, end: 2012 },
      { name: "Freestyle 1.6 (G2)", start: 2013, end: 2017 },
      { name: "Storm 2.0 4WD", start: 2018, end: 2021 },
      { name: "Storm 2.0 4WD (Final)", start: 2021, end: 2021 }
    ],
    "Ranger": [
      { name: "XLT Diesel (G2)", start: 2005, end: 2012 },
      { name: "Limited 3.2 Diesel (G3)", start: 2013, end: 2023 },
      { name: "Limited 3.2 (Final 2023)", start: 2023, end: 2023 },
      { name: "Limited V6 3.0 (G4)", start: 2024 }
    ],
    "Courier": [
      { name: "L 1.6 Rocam", start: 1999, end: 2013 },
      { name: "XL 1.6 Rocam", start: 2005, end: 2013 }
    ],
    "Maverick": [{ name: "Lariat FX4 Turbo", start: 2022 }, { name: "Hybrid Lariat", start: 2023 }]
  },
  "GWM": {
    "Haval H6": [{ name: "HEV Hybrid", start: 2023 }, { name: "PHEV34 Plugin", start: 2023 }, { name: "GT Performance", start: 2023 }],
    "Ora 03": [{ name: "Skin EV", start: 2024 }, { name: "GT EV", start: 2024 }]
  },
  "Honda": {
    "Civic": [
      { name: "LX/LXL (G7)", start: 2001, end: 2006 },
      { name: "LXS/EXS (G8 - New Civic)", start: 2007, end: 2011 },
      { name: "Si 2.0 i-VTEC", start: 2007, end: 2011 },
      { name: "LXR/EXR (G9)", start: 2012, end: 2016 },
      { name: "EXL/Touring Turbo (G10)", start: 2017, end: 2021 },
      { name: "Si 1.5 Turbo (G10)", start: 2018, end: 2021 },
      { name: "Si 2.0 (Imported G11)", start: 2022, end: 2022 },
      { name: "Hybrid (G11)", start: 2023 },
      { name: "Type R", start: 2024 }
    ],
    "Fit": [
      { name: "LX 1.4 MT/CVT (G1)", start: 2004, end: 2008 },
      { name: "EX 1.5 VTEC (G1)", start: 2005, end: 2008 },
      { name: "DX MT (G2)", start: 2011, end: 2014 },
      { name: "EXL CVT (G2)", start: 2009, end: 2014 },
      { name: "Twist 1.5", start: 2013, end: 2014 },
      { name: "EXL CVT (G3)", start: 2015, end: 2021 },
      { name: "DX MT (Final 2022)", start: 2022, end: 2022 },
      { name: "Personal CVT", start: 2018, end: 2021 }
    ],
    "City": [
      { name: "EXL CVT (G2)", start: 2015, end: 2021 },
      { name: "EXL 1.5 (G3 - Novo)", start: 2022 },
      { name: "Touring 1.5 (G3)", start: 2022 },
      { name: "Hatchback EXL", start: 2022 }
    ],
    "HR-V": [
      { name: "EXL 1.8 CVT (G1)", start: 2015, end: 2021 },
      { name: "Touring Turbo (G1)", start: 2019, end: 2021 },
      { name: "EXL 1.5 (G2 - Novo)", start: 2023 },
      { name: "Advance/Touring T270", start: 2023 }
    ]
  },
  "Hyundai": {
    "HB20": [
      { name: "Comfort 1.0 (G1)", start: 2012, end: 2019 },
      { name: "Premium 1.6 AT (G1)", start: 2012, end: 2019 },
      { name: "Comfort 1.0 (Final 2022)", start: 2022, end: 2022 },
      { name: "Evolution Turbo (G2)", start: 2020, end: 2022 },
      { name: "Platinum 1.0 Turbo (G2)", start: 2020, end: 2022 },
      { name: "Platinum Plus (Facelift)", start: 2023 },
      { name: "Limited Plus", start: 2024 }
    ],
    "Creta": [
      { name: "Prestige 2.0 (G1)", start: 2017, end: 2021 },
      { name: "Prestige 2.0 (Final 2022)", start: 2022, end: 2022 },
      { name: "Ultimate 2.0 (G2)", start: 2022 },
      { name: "N Line 1.0 Turbo", start: 2023 },
      { name: "Limited Safety", start: 2024 }
    ],
    "i30": [{ name: "2.0 (G1)", start: 2009, end: 2012 }, { name: "1.8 (G2)", start: 2013, end: 2016 }]
  },
  "Jeep": {
    "Renegade": [
      { name: "Sport 1.8 Flex", start: 2015, end: 2021 },
      { name: "Trailhawk Diesel", start: 2015, end: 2021 },
      { name: "Longitude T270 Turbo", start: 2022 },
      { name: "S T270 4x4", start: 2022 }
    ],
    "Compass": [
      { name: "Longitude 2.0 Flex", start: 2017, end: 2021 },
      { name: "Limited Diesel 4x4", start: 2017, end: 2024 },
      { name: "S T270 Turbo", start: 2021 },
      { name: "S T270 (2023 Update)", start: 2023, end: 2023 },
      { name: "S 4xe Hybrid", start: 2022 },
      { name: "Blackhawk Hurricane", start: 2024 }
    ],
    "Commander": [
      { name: "Limited T270", start: 2022 },
      { name: "Overland T270", start: 2022 },
      { name: "Overland Diesel 4x4", start: 2022, end: 2023 },
      { name: "Overland 2023 Update", start: 2023, end: 2023 },
      { name: "Blackhawk Hurricane", start: 2024 }
    ]
  },
  "Nissan": {
    "Kicks": [{ name: "SL CVT", start: 2017, end: 2021 }, { name: "Exclusive CVT", start: 2022 }, { name: "XPlay Special", start: 2022 }],
    "Versa": [
      { name: "SV 1.6 (G1)", start: 2012, end: 2020 },
      { name: "SV 1.6 (Final 2022)", start: 2022, end: 2022 },
      { name: "Exclusive 1.6 (G2)", start: 2021 }
    ],
    "Frontier": [
      { name: "SEL Diesel (G2)", start: 2008, end: 2016 },
      { name: "LE 4x4 (G3)", start: 2017, end: 2022 },
      { name: "PRO-4X Diesel 4x4", start: 2023 },
      { name: "Platinum Diesel", start: 2023 }
    ],
    "Sentra": [{ name: "SL 2.0 (G7)", start: 2014, end: 2020 }, { name: "Exclusive 2.0 (G8)", start: 2023 }]
  },
  "Renault": {
    "Sandero": [
      { name: "Stepway 1.6 (G1)", start: 2009, end: 2014 },
      { name: "RS 2.0 Racing", start: 2016, end: 2022 },
      { name: "RS 2.0 (Final 2023)", start: 2023, end: 2023 }
    ],
    "Duster": [
      { name: "Dynamique 2.0 (G1)", start: 2012, end: 2020 },
      { name: "Iconic 1.6 CVT", start: 2020 },
      { name: "Iconic 1.3 Turbo", start: 2022, end: 2023 },
      { name: "Plus Iconic Turbo", start: 2024 }
    ],
    "Kwid": [{ name: "Zen 1.0", start: 2017 }, { name: "E-Tech Electric", start: 2022 }, { name: "E-Tech (Final 2023)", start: 2023, end: 2023 }]
  },
  "Toyota": {
    "Corolla": [
      { name: "XEi 1.8 (G9 - Brad Pitt)", start: 2003, end: 2008 },
      { name: "XEi 2.0 (G10 - Seger)", start: 2010, end: 2014 },
      { name: "XEi 2.0 (G11)", start: 2015, end: 2019 },
      { name: "Altis Hybrid (G12)", start: 2020 },
      { name: "Altis 2.0 (Final 2022)", start: 2022, end: 2022 },
      { name: "GR-Sport Turbo", start: 2021 }
    ],
    "Hilux": [
      { name: "SRV Diesel (G7)", start: 2005, end: 2015 },
      { name: "SRX Diesel (G8)", start: 2016 },
      { name: "GR-Sport III", start: 2022, end: 2022 },
      { name: "GR-Sport IV", start: 2023 },
      { name: "SRX Plus", start: 2024 }
    ],
    "SW4": [
      { name: "SRV Diesel (G1)", start: 2006, end: 2015 },
      { name: "Diamond Diesel (G2)", start: 2018, end: 2021 },
      { name: "Diamond Diesel (Final 2023)", start: 2023, end: 2023 },
      { name: "GR-Sport Diesel", start: 2022 }
    ],
    "Yaris": [{ name: "XL 1.3 Hatch", start: 2019, end: 2021 }, { name: "XLS 1.5 CVT", start: 2019 }, { name: "XS CVT", start: 2022 }]
  },
  "Volkswagen": {
    "Gol": [
      { name: "G2 (Bolinha)", start: 1995, end: 1999 },
      { name: "G3 1.0/1.6", start: 2000, end: 2005 },
      { name: "G4 1.0", start: 2006, end: 2014 },
      { name: "G5 Power 1.6", start: 2009, end: 2012 },
      { name: "G6 1.6", start: 2013, end: 2016 },
      { name: "G7/G8 1.0 MPI", start: 2017, end: 2022 },
      { name: "Last Edition 1.0", start: 2023, end: 2023 }
    ],
    "Polo": [
      { name: "Hatch 1.6 (G4)", start: 2003, end: 2014 },
      { name: "Comfortline 200 TSI (G6)", start: 2018, end: 2022 },
      { name: "GTS 250 TSI Turbo", start: 2020 },
      { name: "Track 1.0 MPI", start: 2023 },
      { name: "Highline 170 TSI", start: 2023 }
    ],
    "Golf": [
      { name: "Flash 1.6 (G4.5)", start: 2006, end: 2013 },
      { name: "Highline 1.4 TSI (G7)", start: 2014, end: 2017 },
      { name: "GTI 2.0 TSI (G7)", start: 2014, end: 2019 },
      { name: "GTI (Importado 2023)", start: 2023, end: 2023 },
      { name: "GTE Hybrid", start: 2020 }
    ],
    "Jetta": [
      { name: "2.5 170cv", start: 2007, end: 2010 },
      { name: "Highline 2.0 TSI", start: 2011, end: 2018 },
      { name: "GLI 350 TSI (G7)", start: 2019, end: 2022 },
      { name: "GLI 350 TSI (Final 2023)", start: 2023, end: 2023 },
      { name: "GLI 350 TSI (Novo 2024)", start: 2024 }
    ],
    "T-Cross": [
      { name: "Comfortline 200 TSI", start: 2019, end: 2022 },
      { name: "Comfortline (Final 2023)", start: 2023, end: 2023 },
      { name: "Highline 250 TSI", start: 2019 },
      { name: "The Town Edition", start: 2024 }
    ],
    "Virtus": [
      { name: "Highline 200 TSI", start: 2018, end: 2022 },
      { name: "Exclusive 250 TSI", start: 2023 },
      { name: "Exclusive 2023 Update", start: 2023, end: 2023 },
      { name: "TSI 170 MT/AT", start: 2023 }
    ],
    "Amarok": [{ name: "Highline 2.0 Diesel", start: 2011, end: 2018 }, { name: "Extreme V6 Diesel", start: 2018 }]
  },
  "Volvo": {
    "XC40": [{ name: "T4 Momentum", start: 2018, end: 2021 }, { name: "Recharge Electric", start: 2021 }],
    "XC60": [{ name: "T5 Momentum", start: 2018, end: 2021 }, { name: "T8 Recharge Hybrid", start: 2022 }]
  }
};

interface SearchHistoryItem {
    id: string;
    brand: string;
    model: string;
    year: string;
    version?: string;
    km?: string;
    created_at: string;
}

const VehicleInput: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedVersion, setSelectedVersion] = useState('');
    const [mileage, setMileage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) setRecentSearches(data);
        };
        fetchHistory();
    }, [user]);

    const brands = useMemo(() => Object.keys(carData).sort(), []);

    const models = useMemo(() => {
        if (!selectedBrand || !carData[selectedBrand]) return [];
        return Object.keys(carData[selectedBrand]).sort();
    }, [selectedBrand]);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear() + 1;
        const yearsList = [];
        for (let i = currentYear; i >= 1990; i--) {
            yearsList.push(i.toString());
        }
        return yearsList;
    }, []);

    const versions = useMemo(() => {
        if (!selectedBrand || !selectedModel || !carData[selectedBrand][selectedModel]) return [];
        
        const rawVersions = carData[selectedBrand][selectedModel];
        if (!selectedYear) return [];

        const yearNum = parseInt(selectedYear);

        return rawVersions
            .filter(v => {
                if (typeof v === 'string') return true;
                const startMatch = !v.start || yearNum >= v.start;
                const endMatch = !v.end || yearNum <= v.end;
                return startMatch && endMatch;
            })
            .map(v => typeof v === 'string' ? v : v.name)
            .sort();
    }, [selectedBrand, selectedModel, selectedYear]);

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBrand(e.target.value);
        setSelectedModel('');
        setSelectedYear('');
        setSelectedVersion('');
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(e.target.value);
        setSelectedYear('');
        setSelectedVersion('');
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(e.target.value);
        setSelectedVersion('');
    };

    const handleSearch = async () => {
        if (!selectedBrand || !selectedModel || !selectedYear) return;

        setIsSearching(true);

        if (user) {
            try {
                await supabase.from('search_history').insert({
                    user_id: user.id,
                    brand: selectedBrand,
                    model: selectedModel,
                    version: selectedVersion || null,
                    year: selectedYear,
                    km: mileage || null
                });
            } catch (err) {
                console.error("Error saving search history:", err);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSearching(false);

        navigate(AppRoute.REPORT_RESULT, {
            state: {
                brand: selectedBrand,
                model: selectedModel,
                version: selectedVersion,
                year: selectedYear,
                km: mileage
            }
        });
    };

    const handleSelectHistory = (item: SearchHistoryItem) => {
        setSelectedBrand(item.brand);
        setSelectedModel(item.model);
        setSelectedYear(item.year);
        setSelectedVersion(item.version || '');
        if (item.km) setMileage(item.km);
    };

    return (
        <div className="flex flex-col h-full md:p-10 md:max-w-5xl md:mx-auto">
            <div className="flex items-center bg-surface-light dark:bg-background-dark p-6 pb-4 justify-between sticky top-0 z-10 md:hidden">
                <button onClick={() => navigate(AppRoute.WELCOME)} className="text-slate-900 dark:text-white flex size-14 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
                    <span className="material-symbols-outlined text-[32px]">arrow_back</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight flex-1 text-center">Avaliação Veicular</h2>
                <div className="flex w-14 items-center justify-end">
                    <button onClick={() => navigate(AppRoute.PROFILE)} className="flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
                        <span className="material-symbols-outlined text-[32px]">account_circle</span>
                    </button>
                </div>
            </div>

            <div className="hidden md:flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Avaliação Veicular</h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Catálogo inteligente atualizado com modelos históricos, elétricos e gerações brasileiras.</p>
                </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-12">
                <div className="md:col-span-7 lg:col-span-8">
                    <div className="px-6 pt-6 md:px-0 md:pt-0 md:mb-8">
                        <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl md:text-3xl font-bold leading-tight text-left pb-3">Dados do Carro</h2>
                        <p className="text-slate-500 dark:text-gray-400 text-lg font-medium leading-normal pb-8 md:pb-0">Escolha o ano para filtrar as versões corretas que existiam naquele período.</p>
                    </div>

                    <div className="flex flex-col gap-6 px-6 md:px-0 md:grid md:grid-cols-2 md:gap-8">
                        <label className="flex flex-col w-full">
                            <span className="text-slate-900 dark:text-white text-base font-bold pb-3 uppercase tracking-widest opacity-80">Marca</span>
                            <div className="relative">
                                <select value={selectedBrand} onChange={handleBrandChange} className="appearance-none w-full cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-16 pl-5 pr-12 text-lg font-medium shadow-md focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                                    <option disabled value="">Selecione a Marca</option>
                                    {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-5 text-slate-500 pointer-events-none">
                                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col w-full">
                            <span className="text-slate-900 dark:text-white text-base font-bold pb-3 uppercase tracking-widest opacity-80">Modelo</span>
                            <div className="relative">
                                <select value={selectedModel} onChange={handleModelChange} disabled={!selectedBrand} className="appearance-none w-full cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-16 pl-5 pr-12 text-lg font-medium shadow-md disabled:opacity-40 focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                                    <option disabled value="">Selecione o Modelo</option>
                                    {models.map(model => <option key={model} value={model}>{model}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-5 text-slate-500 pointer-events-none">
                                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col w-full">
                            <span className="text-slate-900 dark:text-white text-base font-bold pb-3 uppercase tracking-widest opacity-80">Ano</span>
                            <div className="relative">
                                <select value={selectedYear} onChange={handleYearChange} disabled={!selectedModel} className="appearance-none w-full cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-16 pl-5 pr-12 text-lg font-medium shadow-md disabled:opacity-40 focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                                    <option disabled value="">Selecione o Ano</option>
                                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-5 text-slate-500 pointer-events-none">
                                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col w-full">
                            <span className="text-slate-900 dark:text-white text-base font-bold pb-3 uppercase tracking-widest opacity-80">Versão</span>
                            <div className="relative">
                                <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)} disabled={!selectedYear} className="appearance-none w-full cursor-pointer rounded-2xl border-2 border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-16 pl-5 pr-12 text-lg font-medium shadow-md disabled:opacity-40 focus:ring-4 focus:ring-primary/10 outline-none transition-all">
                                    <option value="">{selectedYear ? (versions.length > 0 ? "Escolha a Versão..." : "Nenhuma Versão Encontrada") : "Selecione o Ano Primeiro"}</option>
                                    {versions.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-5 text-slate-500 pointer-events-none">
                                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col w-full md:col-span-2">
                            <span className="text-slate-900 dark:text-white text-base font-bold uppercase pb-3 tracking-widest opacity-80">Quilometragem</span>
                            <div className="relative">
                                <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="Ex: 85000" className="w-full rounded-2xl border-2 border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark text-slate-900 dark:text-white h-16 pl-5 pr-16 text-lg font-medium shadow-md focus:ring-4 focus:ring-primary/10 outline-none" />
                                <div className="absolute inset-y-0 right-0 flex items-center px-6 text-slate-500 pointer-events-none">
                                    <span className="text-base font-bold uppercase">km</span>
                                </div>
                            </div>
                        </label>
                    </div>

                    <div className="px-6 pt-10 pb-10 md:px-0">
                        <button onClick={handleSearch} disabled={!selectedBrand || !selectedModel || !selectedYear || isSearching} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary h-16 text-white text-xl font-bold shadow-2xl shadow-primary/30 hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-[0.98]">
                            <span className="material-symbols-outlined text-2xl">{isSearching ? 'progress_activity' : 'network_intelligence'}</span>
                            {isSearching ? 'Sincronizando Dados...' : 'Gerar Relatório IA'}
                        </button>
                    </div>
                </div>

                {recentSearches.length > 0 && (
                    <div className="mt-10 mb-24 md:mt-0 md:col-span-5 lg:col-span-4">
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold px-6 mb-6 md:px-0">Buscas Recentes</h3>
                        <div className="flex overflow-x-auto px-6 pb-6 gap-6 no-scrollbar md:flex-col md:px-0">
                            {recentSearches.map((item) => (
                                <div key={item.id} onClick={() => handleSelectHistory(item)} className="flex min-w-[200px] flex-col rounded-2xl bg-white dark:bg-surface-dark p-5 border border-slate-100 dark:border-transparent cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-highlight transition-all shadow-md">
                                    <p className="text-slate-900 dark:text-white text-lg font-bold truncate">{item.brand} {item.model}</p>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm font-bold mt-2 uppercase">
                                        {item.version ? `${item.version} • ` : ''}{item.year}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleInput;
