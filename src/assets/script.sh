LIST=(
  'ITSA4'
)

for I in ${LIST[*]}
do
  curl "https://www.dadosdemercado.com.br/bolsa/acoes/${I}/dividendos" > "stocks/${I}.txt"
done
