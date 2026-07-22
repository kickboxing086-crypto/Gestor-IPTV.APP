export function generatePixPayload(key: string, amount: number, merchantName = "Gestor IPTV", merchantCity = "Brasil"): string {
  function crc16(payload: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) > 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  }

  const formatStr = (id: string, value: string) => {
    return id + value.length.toString().padStart(2, '0') + value;
  };

  const gui = formatStr("00", "br.gov.bcb.pix");
  const keyStr = formatStr("01", key);
  const merchantAccount = formatStr("26", gui + keyStr);
  const merchantCategory = formatStr("52", "0000");
  const currency = formatStr("53", "986");
  const amountStr = amount > 0 ? formatStr("54", amount.toFixed(2)) : "";
  const country = formatStr("58", "BR");
  
  const formattedName = merchantName.length > 25 ? merchantName.substring(0, 25) : merchantName;
  const merchantNameStr = formatStr("59", formattedName);
  
  const formattedCity = merchantCity.length > 15 ? merchantCity.substring(0, 15) : merchantCity;
  const merchantCityStr = formatStr("60", formattedCity);
  
  const txId = formatStr("05", "***");
  const additionalData = formatStr("62", txId);

  const payloadBase = "000201" + merchantAccount + merchantCategory + currency + amountStr + country + merchantNameStr + merchantCityStr + additionalData + "6304";
  const crc = crc16(payloadBase);
  return payloadBase + crc;
}
