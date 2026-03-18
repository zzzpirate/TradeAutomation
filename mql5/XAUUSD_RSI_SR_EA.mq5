//+------------------------------------------------------------------+
//|                                           XAUUSD_RSI_SR_EA.mq5   |
//|                        Professional Gold Trading Expert Advisor   |
//|                                                                    |
//|  Strategy: RSI + Support/Resistance with Multi-Timeframe Filter   |
//|  Instrument: XAUUSD (Gold)                                        |
//|  Risk Management: Conservative Institutional Style                 |
//+------------------------------------------------------------------+
#property copyright "Professional Trading EA"
#property link      ""
#property version   "1.10"
#property strict

//--- Include standard trading library
#include <Trade/Trade.mqh>
#include <Trade/PositionInfo.mqh>
#include <Trade/OrderInfo.mqh>

//+------------------------------------------------------------------+
//|                    INPUT PARAMETERS                               |
//+------------------------------------------------------------------+

//--- General Settings
input string            InpSymbol              = "XAUUSD";           // Symbol to trade
input ENUM_TIMEFRAMES   InpEntryTimeframe      = PERIOD_M15;         // Entry Timeframe
input ENUM_TIMEFRAMES   InpTrendTimeframe      = PERIOD_H1;          // Trend Filter Timeframe
input long              InpMagicNumber         = 123456;             // Magic Number
input bool              InpEnableDebugLogs     = true;               // Enable Debug Logs

//--- RSI Settings
input int               InpRSIPeriod           = 14;                 // RSI Period
input int               InpRSIOverbought       = 70;                 // RSI Overbought Level
input int               InpRSIOversold         = 30;                 // RSI Oversold Level
input ENUM_APPLIED_PRICE InpRSIPrice           = PRICE_CLOSE;        // RSI Applied Price

//--- Support/Resistance Settings
input int               InpSRLookback          = 50;                 // S/R Lookback Period (candles)
input int               InpZoneTolerance       = 100;                // Zone Tolerance (points)
input bool              InpUseCandleConfirm    = true;               // Use Candle Confirmation

//--- Trend Filter Settings
input bool              InpUseTrendFilter      = true;               // Use Trend Filter
input int               InpEMAPeriod           = 200;                // EMA Period for Trend
input int               InpEMAFastPeriod       = 50;                 // Fast EMA Period

//--- Risk Management Settings
input bool              InpUseFixedLot         = false;              // Use Fixed Lot Size
input double            InpFixedLotSize        = 0.01;               // Fixed Lot Size
input double            InpRiskPercent         = 0.75;               // Risk % per Trade (0.25-2.0)
input int               InpMaxOpenTrades       = 1;                  // Max Open Trades
input int               InpMaxTradesPerDay     = 1;                  // Max Trades Per Day
input double            InpDailyMaxDrawdown    = 3.0;                // Daily Max Drawdown %
input double            InpEquityProtection    = 10.0;               // Equity Protection % (disable trading)
input int               InpMaxSpread           = 50;                 // Max Spread (points)
input int               InpSlippage            = 30;                 // Slippage (points)

//--- Stop Loss / Take Profit Settings
input int               InpSLBuffer            = 50;                 // SL Buffer (points)
input double            InpRiskRewardRatio     = 2.0;                // Risk:Reward Ratio (TP)
input int               InpFixedSLPoints       = 300;                // Fixed SL Points (if not using S/R)
input int               InpFixedTPPoints       = 600;                // Fixed TP Points (if not using S/R)
input bool              InpUseStructureSL      = true;               // Use Structure-based SL/TP

//--- Trade Management Settings
input bool              InpEnableBreakeven     = true;               // Enable Break-even
input double            InpBreakevenTriggerR   = 1.0;                // Break-even Trigger (R multiple)
input int               InpBreakevenOffset     = 10;                 // Break-even Offset (points)
input bool              InpEnableTrailing      = true;               // Enable Trailing Stop
input double            InpTrailingTriggerR    = 1.5;                // Trailing Trigger (R multiple)
input int               InpTrailingDistance    = 150;                // Trailing Distance (points)
input bool              InpEnablePartialTP     = true;               // Enable Partial Take Profit
input double            InpPartialTPLevel      = 1.0;                // Partial TP at (R multiple)
input double            InpPartialTPPercent    = 50.0;               // Partial TP Close % (50 = half)

//--- Session Filter Settings
input bool              InpUseSessionFilter    = true;               // Use Session Filter
input int               InpSessionStartHour    = 13;                 // Session Start Hour (GMT)
input int               InpSessionStartMin     = 0;                  // Session Start Minute
input int               InpSessionEndHour      = 17;                 // Session End Hour (GMT)
input int               InpSessionEndMin       = 0;                  // Session End Minute

//--- Cooldown Settings
input int               InpCooldownCandles     = 3;                  // Cooldown Candles after trade

//--- ATR Settings
input bool              InpUseATRFilter        = true;               // Use ATR Filter
input int               InpATRPeriod           = 14;                 // ATR Period
input double            InpMinATRMultiplier    = 0.5;                // Min ATR Multiplier
input double            InpMaxATRMultiplier    = 3.0;                // Max ATR Multiplier

//--- News Filter Settings (High-Impact Events)
input bool              InpUseNewsFilter       = true;               // Enable News Filter
input int               InpNewsMinutesBefore   = 30;                 // Stop trading X min BEFORE news
input int               InpNewsMinutesAfter    = 30;                 // Resume trading X min AFTER news
input bool              InpFilterNFP           = true;               // Filter NFP (Non-Farm Payrolls)
input bool              InpFilterFOMC          = true;               // Filter FOMC (Fed Rate Decision)
input bool              InpFilterCPI           = true;               // Filter CPI (Inflation Data)
input bool              InpFilterGDP           = true;               // Filter GDP Releases
input bool              InpFilterRetailSales   = true;               // Filter Retail Sales
input bool              InpFilterPMI           = true;               // Filter PMI Data
input bool              InpFilterUnemployment  = true;               // Filter Unemployment Claims
input bool              InpFilterCentralBank   = true;               // Filter All Central Bank Events

//--- Dashboard Settings
input bool              InpShowDashboard       = true;               // Show On-Chart Dashboard
input int               InpDashboardX          = 20;                 // Dashboard X Position
input int               InpDashboardY          = 30;                 // Dashboard Y Position

//+------------------------------------------------------------------+
//|                    GLOBAL VARIABLES                               |
//+------------------------------------------------------------------+

CTrade         trade;                     // Trading object
CPositionInfo  positionInfo;              // Position info object

//--- Indicator handles
int            handleRSI_Entry;           // RSI handle for entry TF
int            handleRSI_Trend;           // RSI handle for trend TF (optional)
int            handleEMA200;              // EMA 200 handle
int            handleEMA50;               // EMA 50 handle
int            handleATR;                 // ATR handle

//--- Runtime variables
datetime       lastBarTime      = 0;      // Last bar time for new candle detection
int            dailyTradeCount  = 0;      // Daily trade counter
datetime       lastTradeDay     = 0;      // Last trade day for reset
double         dayStartBalance  = 0;      // Balance at day start
int            cooldownCounter  = 0;      // Cooldown counter
bool           partialTPDone    = false;  // Partial TP flag for current trade
bool           breakevenDone    = false;  // Breakeven flag for current trade

//--- Support/Resistance levels
double         supportLevel     = 0;      // Current support level
double         resistanceLevel  = 0;      // Current resistance level
double         supportZoneHigh  = 0;      // Support zone upper bound
double         supportZoneLow   = 0;      // Support zone lower bound
double         resistanceZoneHigh = 0;    // Resistance zone upper bound
double         resistanceZoneLow  = 0;    // Resistance zone lower bound

//--- Symbol specifications
double         symbolPoint;               // Point value
int            symbolDigits;              // Digits
double         symbolTickValue;           // Tick value
double         symbolTickSize;            // Tick size
double         symbolMinLot;              // Minimum lot
double         symbolMaxLot;              // Maximum lot
double         symbolLotStep;             // Lot step
double         symbolContractSize;        // Contract size
int            symbolStopLevel;           // Stop level

//--- News filter variables
bool           newsFilterActive    = false;     // Is news filter currently blocking?
string         nextNewsEvent       = "";        // Name of next high-impact event
datetime       nextNewsTime        = 0;         // Time of next high-impact event
datetime       lastNewsCheck       = 0;         // Last time we checked for news

//+------------------------------------------------------------------+
//|                    INITIALIZATION                                 |
//+------------------------------------------------------------------+
int OnInit()
{
   //--- Validate symbol
   if(Symbol() != InpSymbol && InpSymbol != "")
   {
      Print("WARNING: EA is set for ", InpSymbol, " but attached to ", Symbol());
   }
   
   //--- Get symbol specifications
   if(!GetSymbolSpecs())
   {
      Print("ERROR: Failed to get symbol specifications");
      return INIT_FAILED;
   }
   
   //--- Initialize trading object
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetDeviationInPoints(InpSlippage);
   trade.SetTypeFilling(ORDER_FILLING_IOC);
   trade.SetAsyncMode(false);
   
   //--- Create indicator handles
   handleRSI_Entry = iRSI(Symbol(), InpEntryTimeframe, InpRSIPeriod, InpRSIPrice);
   if(handleRSI_Entry == INVALID_HANDLE)
   {
      Print("ERROR: Failed to create RSI indicator handle");
      return INIT_FAILED;
   }
   
   handleEMA200 = iMA(Symbol(), InpTrendTimeframe, InpEMAPeriod, 0, MODE_EMA, PRICE_CLOSE);
   if(handleEMA200 == INVALID_HANDLE)
   {
      Print("ERROR: Failed to create EMA200 indicator handle");
      return INIT_FAILED;
   }
   
   handleEMA50 = iMA(Symbol(), InpTrendTimeframe, InpEMAFastPeriod, 0, MODE_EMA, PRICE_CLOSE);
   if(handleEMA50 == INVALID_HANDLE)
   {
      Print("ERROR: Failed to create EMA50 indicator handle");
      return INIT_FAILED;
   }
   
   handleATR = iATR(Symbol(), InpEntryTimeframe, InpATRPeriod);
   if(handleATR == INVALID_HANDLE)
   {
      Print("ERROR: Failed to create ATR indicator handle");
      return INIT_FAILED;
   }
   
   //--- Initialize daily tracking
   dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   lastTradeDay = iTime(Symbol(), PERIOD_D1, 0);
   dailyTradeCount = CountTodayTrades();
   
   //--- Create dashboard if enabled
   if(InpShowDashboard)
   {
      CreateDashboard();
   }
   
   //--- Log initialization
   if(InpEnableDebugLogs)
   {
      Print("===========================================");
      Print("XAUUSD RSI+S/R EA Initialized Successfully");
      Print("Symbol: ", Symbol());
      Print("Entry TF: ", EnumToString(InpEntryTimeframe));
      Print("Trend TF: ", EnumToString(InpTrendTimeframe));
      Print("Magic Number: ", InpMagicNumber);
      Print("Risk Per Trade: ", InpRiskPercent, "%");
      Print("Max Trades/Day: ", InpMaxTradesPerDay);
      Print("Session: ", InpSessionStartHour, ":", InpSessionStartMin, " - ", InpSessionEndHour, ":", InpSessionEndMin, " GMT");
      Print("===========================================");
   }
   
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//|                    DEINITIALIZATION                               |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   //--- Release indicator handles
   if(handleRSI_Entry != INVALID_HANDLE) IndicatorRelease(handleRSI_Entry);
   if(handleEMA200 != INVALID_HANDLE) IndicatorRelease(handleEMA200);
   if(handleEMA50 != INVALID_HANDLE) IndicatorRelease(handleEMA50);
   if(handleATR != INVALID_HANDLE) IndicatorRelease(handleATR);
   
   //--- Remove dashboard objects
   if(InpShowDashboard)
   {
      DeleteDashboard();
   }
   
   if(InpEnableDebugLogs)
   {
      Print("EA Deinitialized. Reason: ", reason);
   }
}

//+------------------------------------------------------------------+
//|                    MAIN TICK FUNCTION                             |
//+------------------------------------------------------------------+
void OnTick()
{
   //--- Check for new day and reset counters
   CheckNewDay();
   
   //--- Update dashboard
   if(InpShowDashboard)
   {
      UpdateDashboard();
   }
   
   //--- Manage existing positions (trailing, breakeven, partial TP)
   ManageOpenPositions();
   
   //--- Check for new candle on entry timeframe
   datetime currentBarTime = iTime(Symbol(), InpEntryTimeframe, 0);
   if(currentBarTime == lastBarTime)
   {
      return; // Not a new candle, skip signal logic
   }
   lastBarTime = currentBarTime;
   
   //--- Decrement cooldown counter
   if(cooldownCounter > 0)
   {
      cooldownCounter--;
      if(InpEnableDebugLogs && cooldownCounter > 0)
      {
         Print("Cooldown active: ", cooldownCounter, " candles remaining");
      }
      return;
   }
   
   //--- Check all trading filters
   if(!CanTrade())
   {
      return;
   }
   
   //--- Calculate Support/Resistance levels
   CalculateSupportResistance();
   
   //--- Get indicator values
   double rsiValue = GetRSI(1);
   double rsiPrev = GetRSI(2);
   double ema200Value = GetEMA200(1);
   double ema50Value = GetEMA50(1);
   double atrValue = GetATR(1);
   double currentPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   
   if(rsiValue == 0 || ema200Value == 0 || atrValue == 0)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to get indicator values");
      return;
   }
   
   //--- Check for BUY signal
   if(CheckBuySignal(rsiValue, rsiPrev, ema200Value, ema50Value, currentPrice, atrValue))
   {
      ExecuteBuy(atrValue);
   }
   //--- Check for SELL signal
   else if(CheckSellSignal(rsiValue, rsiPrev, ema200Value, ema50Value, currentPrice, atrValue))
   {
      ExecuteSell(atrValue);
   }
}

//+------------------------------------------------------------------+
//|                    SYMBOL SPECIFICATIONS                          |
//+------------------------------------------------------------------+
bool GetSymbolSpecs()
{
   symbolPoint = SymbolInfoDouble(Symbol(), SYMBOL_POINT);
   symbolDigits = (int)SymbolInfoInteger(Symbol(), SYMBOL_DIGITS);
   symbolTickValue = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_TICK_VALUE);
   symbolTickSize = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_TICK_SIZE);
   symbolMinLot = SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_MIN);
   symbolMaxLot = SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_MAX);
   symbolLotStep = SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_STEP);
   symbolContractSize = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_CONTRACT_SIZE);
   symbolStopLevel = (int)SymbolInfoInteger(Symbol(), SYMBOL_TRADE_STOPS_LEVEL);
   
   if(symbolPoint == 0 || symbolTickValue == 0)
   {
      return false;
   }
   
   if(InpEnableDebugLogs)
   {
      Print("Symbol Specs - Point: ", symbolPoint, " Digits: ", symbolDigits, 
            " TickValue: ", symbolTickValue, " MinLot: ", symbolMinLot, 
            " MaxLot: ", symbolMaxLot, " LotStep: ", symbolLotStep,
            " StopLevel: ", symbolStopLevel);
   }
   
   return true;
}

//+------------------------------------------------------------------+
//|                    RSI CALCULATION                                |
//+------------------------------------------------------------------+
double GetRSI(int shift)
{
   double rsiBuffer[];
   ArraySetAsSeries(rsiBuffer, true);
   
   if(CopyBuffer(handleRSI_Entry, 0, shift, 1, rsiBuffer) != 1)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy RSI buffer");
      return 0;
   }
   
   return rsiBuffer[0];
}

//+------------------------------------------------------------------+
//|                    EMA CALCULATIONS                               |
//+------------------------------------------------------------------+
double GetEMA200(int shift)
{
   double emaBuffer[];
   ArraySetAsSeries(emaBuffer, true);
   
   if(CopyBuffer(handleEMA200, 0, shift, 1, emaBuffer) != 1)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy EMA200 buffer");
      return 0;
   }
   
   return emaBuffer[0];
}

double GetEMA50(int shift)
{
   double emaBuffer[];
   ArraySetAsSeries(emaBuffer, true);
   
   if(CopyBuffer(handleEMA50, 0, shift, 1, emaBuffer) != 1)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy EMA50 buffer");
      return 0;
   }
   
   return emaBuffer[0];
}

//+------------------------------------------------------------------+
//|                    ATR CALCULATION                                |
//+------------------------------------------------------------------+
double GetATR(int shift)
{
   double atrBuffer[];
   ArraySetAsSeries(atrBuffer, true);
   
   if(CopyBuffer(handleATR, 0, shift, 1, atrBuffer) != 1)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy ATR buffer");
      return 0;
   }
   
   return atrBuffer[0];
}

//+------------------------------------------------------------------+
//|                 SUPPORT/RESISTANCE DETECTION                      |
//+------------------------------------------------------------------+
void CalculateSupportResistance()
{
   //--- Get price data
   double high[], low[], close[];
   ArraySetAsSeries(high, true);
   ArraySetAsSeries(low, true);
   ArraySetAsSeries(close, true);
   
   int copied = CopyHigh(Symbol(), InpEntryTimeframe, 0, InpSRLookback, high);
   if(copied != InpSRLookback)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy high prices");
      return;
   }
   
   copied = CopyLow(Symbol(), InpEntryTimeframe, 0, InpSRLookback, low);
   if(copied != InpSRLookback)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy low prices");
      return;
   }
   
   copied = CopyClose(Symbol(), InpEntryTimeframe, 0, InpSRLookback, close);
   if(copied != InpSRLookback)
   {
      if(InpEnableDebugLogs) Print("ERROR: Failed to copy close prices");
      return;
   }
   
   //--- Find swing highs and lows
   double swingHighs[];
   double swingLows[];
   ArrayResize(swingHighs, 0);
   ArrayResize(swingLows, 0);
   
   int lookbackWindow = 5; // Candles to look left/right for swing points
   
   for(int i = lookbackWindow; i < InpSRLookback - lookbackWindow; i++)
   {
      //--- Check for swing high
      bool isSwingHigh = true;
      for(int j = 1; j <= lookbackWindow; j++)
      {
         if(high[i] <= high[i-j] || high[i] <= high[i+j])
         {
            isSwingHigh = false;
            break;
         }
      }
      if(isSwingHigh)
      {
         int size = ArraySize(swingHighs);
         ArrayResize(swingHighs, size + 1);
         swingHighs[size] = high[i];
      }
      
      //--- Check for swing low
      bool isSwingLow = true;
      for(int j = 1; j <= lookbackWindow; j++)
      {
         if(low[i] >= low[i-j] || low[i] >= low[i+j])
         {
            isSwingLow = false;
            break;
         }
      }
      if(isSwingLow)
      {
         int size = ArraySize(swingLows);
         ArrayResize(swingLows, size + 1);
         swingLows[size] = low[i];
      }
   }
   
   //--- Find nearest support (highest swing low below current price)
   double currentPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   supportLevel = 0;
   resistanceLevel = 0;
   
   for(int i = 0; i < ArraySize(swingLows); i++)
   {
      if(swingLows[i] < currentPrice)
      {
         if(supportLevel == 0 || swingLows[i] > supportLevel)
         {
            supportLevel = swingLows[i];
         }
      }
   }
   
   //--- Find nearest resistance (lowest swing high above current price)
   for(int i = 0; i < ArraySize(swingHighs); i++)
   {
      if(swingHighs[i] > currentPrice)
      {
         if(resistanceLevel == 0 || swingHighs[i] < resistanceLevel)
         {
            resistanceLevel = swingHighs[i];
         }
      }
   }
   
   //--- If no levels found, use recent high/low
   if(supportLevel == 0)
   {
      supportLevel = low[ArrayMinimum(low)];
   }
   if(resistanceLevel == 0)
   {
      resistanceLevel = high[ArrayMaximum(high)];
   }
   
   //--- Define zones around the levels
   double zoneTolerance = InpZoneTolerance * symbolPoint;
   supportZoneHigh = supportLevel + zoneTolerance;
   supportZoneLow = supportLevel - zoneTolerance;
   resistanceZoneHigh = resistanceLevel + zoneTolerance;
   resistanceZoneLow = resistanceLevel - zoneTolerance;
   
   if(InpEnableDebugLogs)
   {
      Print("S/R Levels - Support: ", DoubleToString(supportLevel, symbolDigits), 
            " (Zone: ", DoubleToString(supportZoneLow, symbolDigits), "-", DoubleToString(supportZoneHigh, symbolDigits), ")",
            " | Resistance: ", DoubleToString(resistanceLevel, symbolDigits),
            " (Zone: ", DoubleToString(resistanceZoneLow, symbolDigits), "-", DoubleToString(resistanceZoneHigh, symbolDigits), ")");
   }
}

//+------------------------------------------------------------------+
//|                    BUY SIGNAL CHECK                               |
//+------------------------------------------------------------------+
bool CheckBuySignal(double rsi, double rsiPrev, double ema200, double ema50, double price, double atr)
{
   //--- Check if already have a BUY position
   if(HasOpenPosition(POSITION_TYPE_BUY))
   {
      return false;
   }
   
   //--- Check if price is near support zone
   bool nearSupport = (price >= supportZoneLow && price <= supportZoneHigh);
   if(!nearSupport)
   {
      return false;
   }
   
   //--- Check RSI condition (oversold or crossing up from oversold)
   bool rsiCondition = (rsi < InpRSIOversold) || (rsi > InpRSIOversold && rsiPrev <= InpRSIOversold);
   if(!rsiCondition)
   {
      return false;
   }
   
   //--- Check trend filter (price above EMA200 on H1)
   if(InpUseTrendFilter)
   {
      double h1Price = iClose(Symbol(), InpTrendTimeframe, 1);
      if(h1Price < ema200)
      {
         if(InpEnableDebugLogs) Print("BUY rejected: Price below EMA200 (trend filter)");
         return false;
      }
      
      //--- Optional: EMA alignment (EMA50 > EMA200)
      if(ema50 < ema200)
      {
         if(InpEnableDebugLogs) Print("BUY rejected: EMA50 below EMA200 (weak trend)");
         return false;
      }
   }
   
   //--- Check candle confirmation (bullish candle)
   if(InpUseCandleConfirm)
   {
      if(!IsBullishCandle(1))
      {
         if(InpEnableDebugLogs) Print("BUY rejected: No bullish candle confirmation");
         return false;
      }
   }
   
   //--- Check ATR filter
   if(InpUseATRFilter)
   {
      double avgATR = GetAverageATR(20);
      if(atr < avgATR * InpMinATRMultiplier || atr > avgATR * InpMaxATRMultiplier)
      {
         if(InpEnableDebugLogs) Print("BUY rejected: ATR filter (abnormal volatility)");
         return false;
      }
   }
   
   if(InpEnableDebugLogs)
   {
      Print("BUY SIGNAL DETECTED! RSI: ", DoubleToString(rsi, 2), 
            " | Price: ", DoubleToString(price, symbolDigits),
            " | Support Zone: ", DoubleToString(supportZoneLow, symbolDigits), "-", DoubleToString(supportZoneHigh, symbolDigits));
   }
   
   return true;
}

//+------------------------------------------------------------------+
//|                    SELL SIGNAL CHECK                              |
//+------------------------------------------------------------------+
bool CheckSellSignal(double rsi, double rsiPrev, double ema200, double ema50, double price, double atr)
{
   //--- Check if already have a SELL position
   if(HasOpenPosition(POSITION_TYPE_SELL))
   {
      return false;
   }
   
   //--- Check if price is near resistance zone
   bool nearResistance = (price >= resistanceZoneLow && price <= resistanceZoneHigh);
   if(!nearResistance)
   {
      return false;
   }
   
   //--- Check RSI condition (overbought or crossing down from overbought)
   bool rsiCondition = (rsi > InpRSIOverbought) || (rsi < InpRSIOverbought && rsiPrev >= InpRSIOverbought);
   if(!rsiCondition)
   {
      return false;
   }
   
   //--- Check trend filter (price below EMA200 on H1)
   if(InpUseTrendFilter)
   {
      double h1Price = iClose(Symbol(), InpTrendTimeframe, 1);
      if(h1Price > ema200)
      {
         if(InpEnableDebugLogs) Print("SELL rejected: Price above EMA200 (trend filter)");
         return false;
      }
      
      //--- Optional: EMA alignment (EMA50 < EMA200)
      if(ema50 > ema200)
      {
         if(InpEnableDebugLogs) Print("SELL rejected: EMA50 above EMA200 (weak trend)");
         return false;
      }
   }
   
   //--- Check candle confirmation (bearish candle)
   if(InpUseCandleConfirm)
   {
      if(!IsBearishCandle(1))
      {
         if(InpEnableDebugLogs) Print("SELL rejected: No bearish candle confirmation");
         return false;
      }
   }
   
   //--- Check ATR filter
   if(InpUseATRFilter)
   {
      double avgATR = GetAverageATR(20);
      if(atr < avgATR * InpMinATRMultiplier || atr > avgATR * InpMaxATRMultiplier)
      {
         if(InpEnableDebugLogs) Print("SELL rejected: ATR filter (abnormal volatility)");
         return false;
      }
   }
   
   if(InpEnableDebugLogs)
   {
      Print("SELL SIGNAL DETECTED! RSI: ", DoubleToString(rsi, 2), 
            " | Price: ", DoubleToString(price, symbolDigits),
            " | Resistance Zone: ", DoubleToString(resistanceZoneLow, symbolDigits), "-", DoubleToString(resistanceZoneHigh, symbolDigits));
   }
   
   return true;
}

//+------------------------------------------------------------------+
//|                 CANDLESTICK CONFIRMATION                          |
//+------------------------------------------------------------------+
bool IsBullishCandle(int shift)
{
   double open = iOpen(Symbol(), InpEntryTimeframe, shift);
   double close = iClose(Symbol(), InpEntryTimeframe, shift);
   double high = iHigh(Symbol(), InpEntryTimeframe, shift);
   double low = iLow(Symbol(), InpEntryTimeframe, shift);
   
   double body = MathAbs(close - open);
   double range = high - low;
   
   //--- Check if bullish (close > open) and body is significant
   if(close > open && body > range * 0.3)
   {
      //--- Check for bullish engulfing pattern
      double prevOpen = iOpen(Symbol(), InpEntryTimeframe, shift + 1);
      double prevClose = iClose(Symbol(), InpEntryTimeframe, shift + 1);
      
      if(prevClose < prevOpen && close > prevOpen && open < prevClose)
      {
         return true; // Bullish engulfing
      }
      
      //--- Simple strong bullish candle
      if(body > range * 0.5)
      {
         return true;
      }
   }
   
   return false;
}

bool IsBearishCandle(int shift)
{
   double open = iOpen(Symbol(), InpEntryTimeframe, shift);
   double close = iClose(Symbol(), InpEntryTimeframe, shift);
   double high = iHigh(Symbol(), InpEntryTimeframe, shift);
   double low = iLow(Symbol(), InpEntryTimeframe, shift);
   
   double body = MathAbs(close - open);
   double range = high - low;
   
   //--- Check if bearish (close < open) and body is significant
   if(close < open && body > range * 0.3)
   {
      //--- Check for bearish engulfing pattern
      double prevOpen = iOpen(Symbol(), InpEntryTimeframe, shift + 1);
      double prevClose = iClose(Symbol(), InpEntryTimeframe, shift + 1);
      
      if(prevClose > prevOpen && close < prevOpen && open > prevClose)
      {
         return true; // Bearish engulfing
      }
      
      //--- Simple strong bearish candle
      if(body > range * 0.5)
      {
         return true;
      }
   }
   
   return false;
}

//+------------------------------------------------------------------+
//|                    AVERAGE ATR CALCULATION                        |
//+------------------------------------------------------------------+
double GetAverageATR(int periods)
{
   double atrBuffer[];
   ArraySetAsSeries(atrBuffer, true);
   
   if(CopyBuffer(handleATR, 0, 1, periods, atrBuffer) != periods)
   {
      return 0;
   }
   
   double sum = 0;
   for(int i = 0; i < periods; i++)
   {
      sum += atrBuffer[i];
   }
   
   return sum / periods;
}

//+------------------------------------------------------------------+
//|                    LOT SIZE CALCULATION                           |
//+------------------------------------------------------------------+
double CalculateLotSize(double slDistance)
{
   double lotSize;
   
   //--- Fixed lot mode
   if(InpUseFixedLot)
   {
      lotSize = InpFixedLotSize;
   }
   else
   {
      //--- Risk % mode
      double accountBalance = AccountInfoDouble(ACCOUNT_BALANCE);
      double riskAmount = accountBalance * (InpRiskPercent / 100.0);
      
      //--- Calculate lot size based on SL distance
      // Risk = Lots * SL_in_points * Tick_Value / Tick_Size
      if(symbolTickSize > 0 && slDistance > 0)
      {
         double slInPrice = slDistance; // Already in price terms
         double ticksInSL = slInPrice / symbolTickSize;
         
         if(ticksInSL > 0 && symbolTickValue > 0)
         {
            lotSize = riskAmount / (ticksInSL * symbolTickValue);
         }
         else
         {
            lotSize = symbolMinLot;
         }
      }
      else
      {
         lotSize = symbolMinLot;
      }
   }
   
   //--- Normalize lot size to broker constraints
   lotSize = NormalizeLot(lotSize);
   
   if(InpEnableDebugLogs)
   {
      Print("Lot Calculation - Risk: ", InpRiskPercent, "% | SL Distance: ", DoubleToString(slDistance, symbolDigits),
            " | Calculated Lot: ", DoubleToString(lotSize, 2));
   }
   
   return lotSize;
}

double NormalizeLot(double lots)
{
   //--- Ensure within min/max
   lots = MathMax(symbolMinLot, lots);
   lots = MathMin(symbolMaxLot, lots);
   
   //--- Round to lot step
   lots = MathFloor(lots / symbolLotStep) * symbolLotStep;
   
   //--- Final normalization
   lots = NormalizeDouble(lots, 2);
   
   return lots;
}

//+------------------------------------------------------------------+
//|                    SL/TP CALCULATION                              |
//+------------------------------------------------------------------+
void CalculateSLTP(ENUM_POSITION_TYPE posType, double entryPrice, double atr, 
                   double &sl, double &tp, double &slDistance)
{
   double minStopDistance = symbolStopLevel * symbolPoint;
   
   if(posType == POSITION_TYPE_BUY)
   {
      if(InpUseStructureSL)
      {
         //--- SL below support zone with buffer
         sl = supportZoneLow - (InpSLBuffer * symbolPoint);
         slDistance = entryPrice - sl;
         
         //--- ATR sanity check - SL should not be too tight
         double minSL = atr * 0.5;
         if(slDistance < minSL)
         {
            slDistance = minSL;
            sl = entryPrice - slDistance;
         }
      }
      else
      {
         //--- Fixed SL
         slDistance = InpFixedSLPoints * symbolPoint;
         sl = entryPrice - slDistance;
      }
      
      //--- Ensure minimum stop distance
      if(slDistance < minStopDistance)
      {
         slDistance = minStopDistance + (10 * symbolPoint);
         sl = entryPrice - slDistance;
      }
      
      //--- Calculate TP based on R:R
      double tpDistance = slDistance * InpRiskRewardRatio;
      tp = entryPrice + tpDistance;
   }
   else // SELL
   {
      if(InpUseStructureSL)
      {
         //--- SL above resistance zone with buffer
         sl = resistanceZoneHigh + (InpSLBuffer * symbolPoint);
         slDistance = sl - entryPrice;
         
         //--- ATR sanity check
         double minSL = atr * 0.5;
         if(slDistance < minSL)
         {
            slDistance = minSL;
            sl = entryPrice + slDistance;
         }
      }
      else
      {
         //--- Fixed SL
         slDistance = InpFixedSLPoints * symbolPoint;
         sl = entryPrice + slDistance;
      }
      
      //--- Ensure minimum stop distance
      if(slDistance < minStopDistance)
      {
         slDistance = minStopDistance + (10 * symbolPoint);
         sl = entryPrice + slDistance;
      }
      
      //--- Calculate TP based on R:R
      double tpDistance = slDistance * InpRiskRewardRatio;
      tp = entryPrice - tpDistance;
   }
   
   //--- Normalize prices
   sl = NormalizeDouble(sl, symbolDigits);
   tp = NormalizeDouble(tp, symbolDigits);
   
   if(InpEnableDebugLogs)
   {
      Print("SL/TP Calculated - Entry: ", DoubleToString(entryPrice, symbolDigits),
            " | SL: ", DoubleToString(sl, symbolDigits),
            " | TP: ", DoubleToString(tp, symbolDigits),
            " | SL Distance: ", DoubleToString(slDistance / symbolPoint, 0), " points");
   }
}

//+------------------------------------------------------------------+
//|                    EXECUTE BUY ORDER                              |
//+------------------------------------------------------------------+
void ExecuteBuy(double atr)
{
   double entryPrice = SymbolInfoDouble(Symbol(), SYMBOL_ASK);
   double sl, tp, slDistance;
   
   //--- Calculate SL/TP
   CalculateSLTP(POSITION_TYPE_BUY, entryPrice, atr, sl, tp, slDistance);
   
   //--- Validate SL distance
   if(slDistance <= 0)
   {
      if(InpEnableDebugLogs) Print("BUY rejected: Invalid SL distance");
      return;
   }
   
   //--- Calculate lot size
   double lots = CalculateLotSize(slDistance);
   if(lots < symbolMinLot)
   {
      if(InpEnableDebugLogs) Print("BUY rejected: Lot size too small");
      return;
   }
   
   //--- Execute order
   string comment = "RSI_SR_EA_BUY_" + IntegerToString(InpMagicNumber);
   
   if(trade.Buy(lots, Symbol(), entryPrice, sl, tp, comment))
   {
      if(trade.ResultRetcode() == TRADE_RETCODE_DONE || trade.ResultRetcode() == TRADE_RETCODE_PLACED)
      {
         dailyTradeCount++;
         cooldownCounter = InpCooldownCandles;
         partialTPDone = false;
         breakevenDone = false;
         
         if(InpEnableDebugLogs)
         {
            Print("===========================================");
            Print("BUY ORDER EXECUTED SUCCESSFULLY!");
            Print("Entry: ", DoubleToString(entryPrice, symbolDigits));
            Print("Lots: ", DoubleToString(lots, 2));
            Print("SL: ", DoubleToString(sl, symbolDigits));
            Print("TP: ", DoubleToString(tp, symbolDigits));
            Print("Ticket: ", trade.ResultOrder());
            Print("===========================================");
         }
         
         //--- Send alert
         if(InpEnableDebugLogs)
         {
            Alert("XAUUSD BUY Executed! Price: ", DoubleToString(entryPrice, symbolDigits));
         }
      }
      else
      {
         Print("BUY order failed. Error: ", trade.ResultRetcode(), " - ", trade.ResultRetcodeDescription());
      }
   }
   else
   {
      Print("BUY order failed. Error: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//|                    EXECUTE SELL ORDER                             |
//+------------------------------------------------------------------+
void ExecuteSell(double atr)
{
   double entryPrice = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   double sl, tp, slDistance;
   
   //--- Calculate SL/TP
   CalculateSLTP(POSITION_TYPE_SELL, entryPrice, atr, sl, tp, slDistance);
   
   //--- Validate SL distance
   if(slDistance <= 0)
   {
      if(InpEnableDebugLogs) Print("SELL rejected: Invalid SL distance");
      return;
   }
   
   //--- Calculate lot size
   double lots = CalculateLotSize(slDistance);
   if(lots < symbolMinLot)
   {
      if(InpEnableDebugLogs) Print("SELL rejected: Lot size too small");
      return;
   }
   
   //--- Execute order
   string comment = "RSI_SR_EA_SELL_" + IntegerToString(InpMagicNumber);
   
   if(trade.Sell(lots, Symbol(), entryPrice, sl, tp, comment))
   {
      if(trade.ResultRetcode() == TRADE_RETCODE_DONE || trade.ResultRetcode() == TRADE_RETCODE_PLACED)
      {
         dailyTradeCount++;
         cooldownCounter = InpCooldownCandles;
         partialTPDone = false;
         breakevenDone = false;
         
         if(InpEnableDebugLogs)
         {
            Print("===========================================");
            Print("SELL ORDER EXECUTED SUCCESSFULLY!");
            Print("Entry: ", DoubleToString(entryPrice, symbolDigits));
            Print("Lots: ", DoubleToString(lots, 2));
            Print("SL: ", DoubleToString(sl, symbolDigits));
            Print("TP: ", DoubleToString(tp, symbolDigits));
            Print("Ticket: ", trade.ResultOrder());
            Print("===========================================");
         }
         
         //--- Send alert
         if(InpEnableDebugLogs)
         {
            Alert("XAUUSD SELL Executed! Price: ", DoubleToString(entryPrice, symbolDigits));
         }
      }
      else
      {
         Print("SELL order failed. Error: ", trade.ResultRetcode(), " - ", trade.ResultRetcodeDescription());
      }
   }
   else
   {
      Print("SELL order failed. Error: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//|                 MANAGE OPEN POSITIONS                             |
//+------------------------------------------------------------------+
void ManageOpenPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(positionInfo.SelectByIndex(i))
      {
         //--- Check if position belongs to this EA
         if(positionInfo.Symbol() != Symbol() || positionInfo.Magic() != InpMagicNumber)
            continue;
         
         ulong ticket = positionInfo.Ticket();
         double openPrice = positionInfo.PriceOpen();
         double currentSL = positionInfo.StopLoss();
         double currentTP = positionInfo.TakeProfit();
         double posLots = positionInfo.Volume();
         double currentPrice = positionInfo.PriceCurrent();
         ENUM_POSITION_TYPE posType = positionInfo.PositionType();
         
         //--- Calculate profit in R-multiples
         double slDistance = MathAbs(openPrice - currentSL);
         double currentProfit = (posType == POSITION_TYPE_BUY) ? 
                                (currentPrice - openPrice) : (openPrice - currentPrice);
         double rMultiple = (slDistance > 0) ? currentProfit / slDistance : 0;
         
         //--- Partial Take Profit
         if(InpEnablePartialTP && !partialTPDone && rMultiple >= InpPartialTPLevel)
         {
            double closeLots = NormalizeLot(posLots * (InpPartialTPPercent / 100.0));
            if(closeLots >= symbolMinLot)
            {
               if(trade.PositionClosePartial(ticket, closeLots))
               {
                  partialTPDone = true;
                  if(InpEnableDebugLogs)
                  {
                     Print("PARTIAL TP executed at ", DoubleToString(rMultiple, 2), "R - Closed ", 
                           DoubleToString(closeLots, 2), " lots");
                  }
               }
            }
         }
         
         //--- Break-even
         if(InpEnableBreakeven && !breakevenDone && rMultiple >= InpBreakevenTriggerR)
         {
            double newSL;
            if(posType == POSITION_TYPE_BUY)
            {
               newSL = openPrice + (InpBreakevenOffset * symbolPoint);
               if(newSL > currentSL)
               {
                  if(trade.PositionModify(ticket, newSL, currentTP))
                  {
                     breakevenDone = true;
                     if(InpEnableDebugLogs)
                     {
                        Print("BREAK-EVEN set at ", DoubleToString(newSL, symbolDigits));
                     }
                  }
               }
            }
            else // SELL
            {
               newSL = openPrice - (InpBreakevenOffset * symbolPoint);
               if(newSL < currentSL || currentSL == 0)
               {
                  if(trade.PositionModify(ticket, newSL, currentTP))
                  {
                     breakevenDone = true;
                     if(InpEnableDebugLogs)
                     {
                        Print("BREAK-EVEN set at ", DoubleToString(newSL, symbolDigits));
                     }
                  }
               }
            }
         }
         
         //--- Trailing Stop
         if(InpEnableTrailing && breakevenDone && rMultiple >= InpTrailingTriggerR)
         {
            double trailDistance = InpTrailingDistance * symbolPoint;
            double newSL;
            
            if(posType == POSITION_TYPE_BUY)
            {
               newSL = currentPrice - trailDistance;
               newSL = NormalizeDouble(newSL, symbolDigits);
               
               if(newSL > currentSL && newSL > openPrice)
               {
                  if(trade.PositionModify(ticket, newSL, currentTP))
                  {
                     if(InpEnableDebugLogs)
                     {
                        Print("TRAILING STOP updated to ", DoubleToString(newSL, symbolDigits));
                     }
                  }
               }
            }
            else // SELL
            {
               newSL = currentPrice + trailDistance;
               newSL = NormalizeDouble(newSL, symbolDigits);
               
               if(newSL < currentSL || currentSL == 0)
               {
                  if(trade.PositionModify(ticket, newSL, currentTP))
                  {
                     if(InpEnableDebugLogs)
                     {
                        Print("TRAILING STOP updated to ", DoubleToString(newSL, symbolDigits));
                     }
                  }
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//|                    TRADING FILTERS                                |
//+------------------------------------------------------------------+
bool CanTrade()
{
   //--- Check max open trades
   if(CountOpenPositions() >= InpMaxOpenTrades)
   {
      if(InpEnableDebugLogs) Print("Filter: Max open trades reached (", CountOpenPositions(), "/", InpMaxOpenTrades, ")");
      return false;
   }
   
   //--- Check max trades per day
   if(dailyTradeCount >= InpMaxTradesPerDay)
   {
      if(InpEnableDebugLogs) Print("Filter: Max daily trades reached (", dailyTradeCount, "/", InpMaxTradesPerDay, ")");
      return false;
   }
   
   //--- Check daily drawdown
   double currentBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   double dailyDrawdown = ((dayStartBalance - currentBalance) / dayStartBalance) * 100;
   if(dailyDrawdown >= InpDailyMaxDrawdown)
   {
      if(InpEnableDebugLogs) Print("Filter: Daily max drawdown exceeded (", DoubleToString(dailyDrawdown, 2), "%)");
      return false;
   }
   
   //--- Check equity protection
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equityDrawdown = ((balance - equity) / balance) * 100;
   if(equityDrawdown >= InpEquityProtection)
   {
      if(InpEnableDebugLogs) Print("Filter: Equity protection triggered (", DoubleToString(equityDrawdown, 2), "%)");
      return false;
   }
   
   //--- Check spread
   double spread = SymbolInfoInteger(Symbol(), SYMBOL_SPREAD);
   if(spread > InpMaxSpread)
   {
      if(InpEnableDebugLogs) Print("Filter: Spread too high (", spread, " > ", InpMaxSpread, ")");
      return false;
   }
   
   //--- Check session
   if(InpUseSessionFilter && !IsWithinTradingSession())
   {
      if(InpEnableDebugLogs) Print("Filter: Outside trading session");
      return false;
   }
   
   //--- Check news filter
   if(InpUseNewsFilter && IsHighImpactNewsTime())
   {
      if(InpEnableDebugLogs) Print("Filter: High-impact news event - ", nextNewsEvent);
      return false;
   }
   
   return true;
}

bool IsWithinTradingSession()
{
   MqlDateTime dt;
   TimeToStruct(TimeGMT(), dt);
   
   int currentMinutes = dt.hour * 60 + dt.min;
   int startMinutes = InpSessionStartHour * 60 + InpSessionStartMin;
   int endMinutes = InpSessionEndHour * 60 + InpSessionEndMin;
   
   return (currentMinutes >= startMinutes && currentMinutes < endMinutes);
}

//+------------------------------------------------------------------+
//|                    NEWS FILTER FUNCTIONS                          |
//+------------------------------------------------------------------+

//--- Check if we're near a high-impact news event
bool IsHighImpactNewsTime()
{
   //--- Only check every 60 seconds to reduce overhead
   if(TimeCurrent() - lastNewsCheck < 60)
   {
      return newsFilterActive;
   }
   lastNewsCheck = TimeCurrent();
   
   //--- Try to use MT5 Economic Calendar first
   if(CheckEconomicCalendar())
   {
      return newsFilterActive;
   }
   
   //--- Fallback to scheduled events check
   return CheckScheduledEvents();
}

//+------------------------------------------------------------------+
//|  Check MT5 Economic Calendar for high-impact events               |
//+------------------------------------------------------------------+
bool CheckEconomicCalendar()
{
   //--- Define the time window to check
   datetime fromTime = TimeCurrent() - InpNewsMinutesAfter * 60;
   datetime toTime = TimeCurrent() + InpNewsMinutesBefore * 60;
   
   MqlCalendarValue values[];
   
   //--- Try to get calendar values (USD events affect gold)
   int count = CalendarValueHistory(values, fromTime, toTime, NULL, "USD");
   
   if(count <= 0)
   {
      //--- Calendar might not be available, return false to use fallback
      return false;
   }
   
   newsFilterActive = false;
   nextNewsEvent = "";
   nextNewsTime = 0;
   
   for(int i = 0; i < count; i++)
   {
      MqlCalendarEvent event;
      if(!CalendarEventById(values[i].event_id, event))
         continue;
      
      //--- Check if this is a high-impact event
      if(event.importance != CALENDAR_IMPORTANCE_HIGH)
         continue;
      
      //--- Check if event matches our filters
      string eventName = event.name;
      bool shouldFilter = false;
      
      //--- NFP (Non-Farm Payrolls)
      if(InpFilterNFP && (StringFind(eventName, "Nonfarm") >= 0 || 
                          StringFind(eventName, "Non-Farm") >= 0 ||
                          StringFind(eventName, "NFP") >= 0 ||
                          StringFind(eventName, "Employment Change") >= 0))
      {
         shouldFilter = true;
      }
      
      //--- FOMC (Federal Reserve)
      if(InpFilterFOMC && (StringFind(eventName, "FOMC") >= 0 || 
                           StringFind(eventName, "Federal Funds Rate") >= 0 ||
                           StringFind(eventName, "Fed Interest") >= 0 ||
                           StringFind(eventName, "Powell") >= 0))
      {
         shouldFilter = true;
      }
      
      //--- CPI (Consumer Price Index)
      if(InpFilterCPI && (StringFind(eventName, "CPI") >= 0 || 
                          StringFind(eventName, "Consumer Price") >= 0 ||
                          StringFind(eventName, "Inflation") >= 0))
      {
         shouldFilter = true;
      }
      
      //--- GDP
      if(InpFilterGDP && (StringFind(eventName, "GDP") >= 0 ||
                          StringFind(eventName, "Gross Domestic") >= 0))
      {
         shouldFilter = true;
      }
      
      //--- Retail Sales
      if(InpFilterRetailSales && StringFind(eventName, "Retail Sales") >= 0)
      {
         shouldFilter = true;
      }
      
      //--- PMI
      if(InpFilterPMI && (StringFind(eventName, "PMI") >= 0 ||
                          StringFind(eventName, "Purchasing Manager") >= 0 ||
                          StringFind(eventName, "ISM") >= 0))
      {
         shouldFilter = true;
      }
      
      //--- Unemployment
      if(InpFilterUnemployment && (StringFind(eventName, "Unemployment") >= 0 ||
                                    StringFind(eventName, "Jobless") >= 0 ||
                                    StringFind(eventName, "Initial Claims") >= 0))
      {
         shouldFilter = true;
      }
      
      //--- Central Bank events
      if(InpFilterCentralBank && (StringFind(eventName, "Central Bank") >= 0 ||
                                   StringFind(eventName, "ECB") >= 0 ||
                                   StringFind(eventName, "BOE") >= 0 ||
                                   StringFind(eventName, "BOJ") >= 0 ||
                                   StringFind(eventName, "RBA") >= 0 ||
                                   StringFind(eventName, "Interest Rate") >= 0))
      {
         shouldFilter = true;
      }
      
      if(shouldFilter)
      {
         datetime eventTime = values[i].time;
         datetime bufferStart = eventTime - InpNewsMinutesBefore * 60;
         datetime bufferEnd = eventTime + InpNewsMinutesAfter * 60;
         
         if(TimeCurrent() >= bufferStart && TimeCurrent() <= bufferEnd)
         {
            newsFilterActive = true;
            nextNewsEvent = eventName;
            nextNewsTime = eventTime;
            
            if(InpEnableDebugLogs)
            {
               Print("NEWS FILTER ACTIVE: ", eventName, " at ", TimeToString(eventTime));
            }
            return true;
         }
         
         //--- Track next upcoming event
         if(eventTime > TimeCurrent() && (nextNewsTime == 0 || eventTime < nextNewsTime))
         {
            nextNewsEvent = eventName;
            nextNewsTime = eventTime;
         }
      }
   }
   
   return true; // Calendar was available
}

//+------------------------------------------------------------------+
//|  Fallback: Check for known scheduled events by day/time          |
//+------------------------------------------------------------------+
bool CheckScheduledEvents()
{
   newsFilterActive = false;
   
   MqlDateTime dt;
   TimeToStruct(TimeGMT(), dt);
   
   //--- NFP: First Friday of each month at 13:30 GMT
   if(InpFilterNFP && dt.day_of_week == 5 && dt.day <= 7)
   {
      if(IsNearTime(dt, 13, 30))
      {
         newsFilterActive = true;
         nextNewsEvent = "NFP (Non-Farm Payrolls)";
         return true;
      }
   }
   
   //--- CPI: Usually around 13:30 GMT on release day (mid-month)
   if(InpFilterCPI && dt.day >= 10 && dt.day <= 15)
   {
      if(IsNearTime(dt, 13, 30))
      {
         newsFilterActive = true;
         nextNewsEvent = "CPI Release (Scheduled)";
         return true;
      }
   }
   
   //--- FOMC: Usually 19:00 GMT on decision days (8 times/year)
   if(InpFilterFOMC)
   {
      //--- FOMC meetings are typically mid-week
      if(dt.day_of_week >= 2 && dt.day_of_week <= 4)
      {
         if(IsNearTime(dt, 19, 0))
         {
            //--- This is approximate - real FOMC dates vary
            newsFilterActive = true;
            nextNewsEvent = "FOMC Decision (Possible)";
            return true;
         }
      }
   }
   
   //--- Unemployment Claims: Every Thursday at 13:30 GMT
   if(InpFilterUnemployment && dt.day_of_week == 4)
   {
      if(IsNearTime(dt, 13, 30))
      {
         newsFilterActive = true;
         nextNewsEvent = "Weekly Unemployment Claims";
         return true;
      }
   }
   
   return false;
}

//+------------------------------------------------------------------+
//|  Helper: Check if current time is near target time               |
//+------------------------------------------------------------------+
bool IsNearTime(MqlDateTime &dt, int targetHour, int targetMin)
{
   int currentMinutes = dt.hour * 60 + dt.min;
   int targetMinutes = targetHour * 60 + targetMin;
   
   int diff = MathAbs(currentMinutes - targetMinutes);
   
   //--- Check if within buffer window
   return (diff <= InpNewsMinutesBefore || diff <= InpNewsMinutesAfter);
}

//+------------------------------------------------------------------+
//|  Get news filter status for dashboard                            |
//+------------------------------------------------------------------+
string GetNewsFilterStatus()
{
   if(!InpUseNewsFilter)
      return "DISABLED";
   
   if(newsFilterActive)
      return "BLOCKED: " + nextNewsEvent;
   
   if(nextNewsTime > 0)
   {
      int minutesUntil = (int)((nextNewsTime - TimeCurrent()) / 60);
      if(minutesUntil > 0 && minutesUntil <= 120)
         return "Next: " + IntegerToString(minutesUntil) + "m";
   }
   
   return "CLEAR";
}

//+------------------------------------------------------------------+
//|                    POSITION HELPERS                               |
//+------------------------------------------------------------------+
int CountOpenPositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(positionInfo.SelectByIndex(i))
      {
         if(positionInfo.Symbol() == Symbol() && positionInfo.Magic() == InpMagicNumber)
         {
            count++;
         }
      }
   }
   return count;
}

bool HasOpenPosition(ENUM_POSITION_TYPE posType)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(positionInfo.SelectByIndex(i))
      {
         if(positionInfo.Symbol() == Symbol() && 
            positionInfo.Magic() == InpMagicNumber &&
            positionInfo.PositionType() == posType)
         {
            return true;
         }
      }
   }
   return false;
}

int CountTodayTrades()
{
   int count = 0;
   datetime todayStart = iTime(Symbol(), PERIOD_D1, 0);
   
   //--- Check history
   HistorySelect(todayStart, TimeCurrent());
   for(int i = HistoryDealsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket > 0)
      {
         if(HistoryDealGetString(ticket, DEAL_SYMBOL) == Symbol() &&
            HistoryDealGetInteger(ticket, DEAL_MAGIC) == InpMagicNumber &&
            HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN)
         {
            count++;
         }
      }
   }
   
   //--- Add currently open positions
   count += CountOpenPositions();
   
   return count;
}

//+------------------------------------------------------------------+
//|                    NEW DAY CHECK                                  |
//+------------------------------------------------------------------+
void CheckNewDay()
{
   datetime currentDay = iTime(Symbol(), PERIOD_D1, 0);
   if(currentDay != lastTradeDay)
   {
      //--- New day detected
      lastTradeDay = currentDay;
      dailyTradeCount = 0;
      dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
      
      if(InpEnableDebugLogs)
      {
         Print("=== NEW TRADING DAY ===");
         Print("Day Start Balance: ", DoubleToString(dayStartBalance, 2));
      }
   }
}

//+------------------------------------------------------------------+
//|                    DASHBOARD FUNCTIONS                            |
//+------------------------------------------------------------------+
void CreateDashboard()
{
   string prefix = "EA_Dashboard_";
   int yOffset = InpDashboardY;
   int lineHeight = 18;
   
   //--- Background rectangle (increased height for news filter)
   ObjectCreate(0, prefix + "BG", OBJ_RECTANGLE_LABEL, 0, 0, 0);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_XDISTANCE, InpDashboardX - 5);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_YDISTANCE, InpDashboardY - 5);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_XSIZE, 300);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_YSIZE, 280);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_BGCOLOR, clrBlack);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_BORDER_COLOR, clrGold);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_BORDER_TYPE, BORDER_FLAT);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, prefix + "BG", OBJPROP_BACK, false);
   
   //--- Create labels
   CreateLabel(prefix + "Title", "XAUUSD RSI+S/R EA v1.1", InpDashboardX, yOffset, clrGold, 12);
   yOffset += lineHeight + 5;
   
   CreateLabel(prefix + "Separator1", "--------------------------------", InpDashboardX, yOffset, clrDarkGray, 9);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "RSI", "RSI: ---", InpDashboardX, yOffset, clrWhite, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Support", "Support: ---", InpDashboardX, yOffset, clrLime, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Resistance", "Resistance: ---", InpDashboardX, yOffset, clrRed, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Spread", "Spread: ---", InpDashboardX, yOffset, clrWhite, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "ATR", "ATR: ---", InpDashboardX, yOffset, clrWhite, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Separator2", "--------------------------------", InpDashboardX, yOffset, clrDarkGray, 9);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "DailyTrades", "Daily Trades: 0/" + IntegerToString(InpMaxTradesPerDay), InpDashboardX, yOffset, clrYellow, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "OpenPos", "Open Positions: 0/" + IntegerToString(InpMaxOpenTrades), InpDashboardX, yOffset, clrYellow, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "RiskMode", "Risk: " + DoubleToString(InpRiskPercent, 2) + "%", InpDashboardX, yOffset, clrCyan, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Session", "Session: ---", InpDashboardX, yOffset, clrWhite, 10);
   yOffset += lineHeight;
   
   //--- News Filter Status
   CreateLabel(prefix + "NewsFilter", "News: ---", InpDashboardX, yOffset, clrWhite, 10);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Separator3", "--------------------------------", InpDashboardX, yOffset, clrDarkGray, 9);
   yOffset += lineHeight;
   
   CreateLabel(prefix + "Status", "Status: READY", InpDashboardX, yOffset, clrLime, 10);
}

void CreateLabel(string name, string text, int x, int y, color clr, int fontSize)
{
   ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, fontSize);
   ObjectSetString(0, name, OBJPROP_FONT, "Consolas");
   ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
}

void UpdateDashboard()
{
   string prefix = "EA_Dashboard_";
   
   //--- Update RSI
   double rsi = GetRSI(1);
   color rsiColor = (rsi < InpRSIOversold) ? clrLime : (rsi > InpRSIOverbought) ? clrRed : clrWhite;
   ObjectSetString(0, prefix + "RSI", OBJPROP_TEXT, "RSI: " + DoubleToString(rsi, 2));
   ObjectSetInteger(0, prefix + "RSI", OBJPROP_COLOR, rsiColor);
   
   //--- Update Support/Resistance
   ObjectSetString(0, prefix + "Support", OBJPROP_TEXT, "Support: " + DoubleToString(supportLevel, symbolDigits));
   ObjectSetString(0, prefix + "Resistance", OBJPROP_TEXT, "Resistance: " + DoubleToString(resistanceLevel, symbolDigits));
   
   //--- Update Spread
   double spread = SymbolInfoInteger(Symbol(), SYMBOL_SPREAD);
   color spreadColor = (spread > InpMaxSpread) ? clrRed : clrLime;
   ObjectSetString(0, prefix + "Spread", OBJPROP_TEXT, "Spread: " + DoubleToString(spread, 0) + " pts");
   ObjectSetInteger(0, prefix + "Spread", OBJPROP_COLOR, spreadColor);
   
   //--- Update ATR
   double atr = GetATR(1);
   ObjectSetString(0, prefix + "ATR", OBJPROP_TEXT, "ATR: " + DoubleToString(atr, symbolDigits));
   
   //--- Update Daily Trades
   ObjectSetString(0, prefix + "DailyTrades", OBJPROP_TEXT, "Daily Trades: " + IntegerToString(dailyTradeCount) + "/" + IntegerToString(InpMaxTradesPerDay));
   
   //--- Update Open Positions
   int openPos = CountOpenPositions();
   ObjectSetString(0, prefix + "OpenPos", OBJPROP_TEXT, "Open Positions: " + IntegerToString(openPos) + "/" + IntegerToString(InpMaxOpenTrades));
   
   //--- Update Session Status
   bool inSession = IsWithinTradingSession();
   ObjectSetString(0, prefix + "Session", OBJPROP_TEXT, "Session: " + (inSession ? "ACTIVE" : "CLOSED"));
   ObjectSetInteger(0, prefix + "Session", OBJPROP_COLOR, inSession ? clrLime : clrRed);
   
   //--- Update News Filter Status
   string newsStatus = GetNewsFilterStatus();
   color newsColor = clrLime;
   if(StringFind(newsStatus, "BLOCKED") >= 0)
      newsColor = clrRed;
   else if(StringFind(newsStatus, "Next:") >= 0)
      newsColor = clrYellow;
   else if(StringFind(newsStatus, "DISABLED") >= 0)
      newsColor = clrGray;
   
   ObjectSetString(0, prefix + "NewsFilter", OBJPROP_TEXT, "News: " + newsStatus);
   ObjectSetInteger(0, prefix + "NewsFilter", OBJPROP_COLOR, newsColor);
   
   //--- Update Status
   string status = "READY";
   color statusColor = clrLime;
   
   if(dailyTradeCount >= InpMaxTradesPerDay)
   {
      status = "MAX DAILY TRADES";
      statusColor = clrOrange;
   }
   else if(newsFilterActive && InpUseNewsFilter)
   {
      status = "NEWS FILTER";
      statusColor = clrRed;
   }
   else if(spread > InpMaxSpread)
   {
      status = "HIGH SPREAD";
      statusColor = clrRed;
   }
   else if(!inSession && InpUseSessionFilter)
   {
      status = "SESSION CLOSED";
      statusColor = clrGray;
   }
   else if(cooldownCounter > 0)
   {
      status = "COOLDOWN: " + IntegerToString(cooldownCounter);
      statusColor = clrYellow;
   }
   
   ObjectSetString(0, prefix + "Status", OBJPROP_TEXT, "Status: " + status);
   ObjectSetInteger(0, prefix + "Status", OBJPROP_COLOR, statusColor);
   
   ChartRedraw(0);
}

void DeleteDashboard()
{
   string prefix = "EA_Dashboard_";
   ObjectsDeleteAll(0, prefix);
}

//+------------------------------------------------------------------+
//|                    END OF EXPERT ADVISOR                          |
//+------------------------------------------------------------------+
