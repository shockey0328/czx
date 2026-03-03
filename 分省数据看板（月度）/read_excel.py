import pandas as pd

try:
    xls = pd.ExcelFile('分省趋势数据.xlsx')
    print("Sheet names:", xls.sheet_names)
    print("\n")
    
    for sheet in xls.sheet_names:
        print(f"=== {sheet} ===")
        df = pd.read_excel(xls, sheet_name=sheet)
        print(df.head(10))
        print("\n")
except Exception as e:
    print(f"Error: {e}")
