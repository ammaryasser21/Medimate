'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Search,
  ShieldAlert,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Tag,
  Stethoscope,
  Layers,
  Clipboard,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { medicineAPI } from '@/lib/axios';

interface Medicine {
  SIDEEFFECT: string[];
  Uses: string[];
  CLASS: string[];
  NAME: string;
  id: number;
}

interface ApiResponse {
  medicines: Medicine[];
  totalPages: number;
  totalItems: number;
  classes: string[];
  uses: string[];
}


const ITEMS_PER_PAGE = 6;

export default function RecommendationPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [expandedMedicine, setExpandedMedicine] = useState<number | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    classes: string[];
    uses: string[];
  }>({
    classes: [],
    uses: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableUses, setAvailableUses] = useState<string[]>([]);
  const { user, addToFavorites, removeFromFavorites } = useAuth();

  useEffect(() => {
    const fetchMedicines = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                search: searchQuery,
                classes: selectedFilters.classes.join(','),
                uses: selectedFilters.uses.join(','),
            });

            const response = await medicineAPI.get<ApiResponse>(`/medicines?${params}`);
            console.log(response.data);

            const { medicines: rawMedicines, totalPages, classes, uses } = response.data;

            setMedicines(rawMedicines);
            setTotalPages(totalPages);
            setAvailableClasses(classes);
            setAvailableUses(uses);

        } catch (error: any) {
            console.error('Failed to fetch medicines:', error);
            toast.error('Failed to load medicines. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const query = searchParams.get('search');
    if (query) {
        setSearchQuery(decodeURIComponent(query));
    }

    fetchMedicines();
}, [currentPage, searchQuery, selectedFilters, searchParams]);



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedMedicine(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = window.innerWidth < 640 ? 3 : 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );

    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={currentPage === 1 ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(
          <Button
            key="dots-start"
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-default sm:h-9 sm:w-9"
            disabled
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <Button
            key="dots-end"
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-default sm:h-9 sm:w-9"
            disabled
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-9 sm:w-9"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFavoriteToggle = (medicine: Medicine) => {
    if (!user) {
      toast.error('Please login to add medicines to favorites');
      return;
    }

    const isFavorite = user.favorites?.some((fav) => fav.id === medicine.id);
    if (isFavorite) {
      removeFromFavorites(medicine.id);
      toast.success(`${medicine.NAME} removed from favorites`);
    } else {
      addToFavorites({
        id: medicine.id,
        name: medicine.NAME,
        category: '',
        dosage: '',
        usage: medicine.Uses.join(', '),
        sideEffects: medicine.SIDEEFFECT,
        rating: 4.0,
        reviews: 100,
      });
      toast.success(`${medicine.NAME} added to favorites`);
    }
  };

  const isFavorite = (medicineId: number) => {
    return user?.favorites?.some((fav) => fav.id === medicineId);
  };

  const toggleExpand = (id: number) => {
    setExpandedMedicine(expandedMedicine === id ? null : id);
  };

  const toggleFilter = (type: 'classes' | 'uses', value: string) => {
    setSelectedFilters((prev) => {
      const current = [...prev[type]];
      const index = current.indexOf(value);

      if (index === -1) {
        current.push(value);
      } else {
        current.splice(index, 1);
      }

      return {
        ...prev,
        [type]: current,
      };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters({
      classes: [],
      uses: [],
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="container max-w-6xl px-2 py-4 sm:px-6 sm:py-8 lg:py-12 animate-fade-up">
      <div className="mb-4 text-center sm:mb-8">
        <h1 className="text-xl font-bold sm:text-3xl lg:text-4xl">
          Medicine Information
        </h1>
        <p className="mt-2 text-xs text-muted-foreground sm:text-base">
          Find detailed information about medicines, their uses, side effects,
          and alternatives
        </p>
      </div>

      <div className="mb-4 space-y-3 sm:mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground sm:h-4 sm:w-4" />
            <Input
              placeholder="Search medicines, uses, or classes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 text-xs sm:pl-9 sm:text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 sm:h-7 sm:w-7"
                onClick={() => handleSearch('')}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex h-8 gap-1.5 text-xs sm:h-9 sm:gap-2 sm:text-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Filters</span>
              {(selectedFilters.classes.length > 0 ||
                selectedFilters.uses.length > 0) && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 px-1.5 text-[10px]"
                >
                  {selectedFilters.classes.length + selectedFilters.uses.length}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              asChild
              className="h-8 gap-1.5 text-xs sm:h-9 sm:gap-2 sm:text-sm"
            >
              <Link href="/profile?tab=favorites">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Favorites</span>
              </Link>
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="p-3 animate-in fade-in-0 zoom-in-95 duration-200 sm:p-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm font-medium sm:text-base">
                Filter Medicines
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs sm:h-8 sm:text-sm"
              >
                Clear All
              </Button>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 flex items-center text-xs font-medium sm:text-sm">
                  <Tag className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                  Medicine Classes
                </h4>
                <ScrollArea className="h-[160px] rounded-md border p-2 sm:h-[180px]">
                  <div className="space-y-1">
                    {availableClasses.map((cls) => (
                      <div key={cls} className="flex items-center">
                        <Button
                          variant={
                            selectedFilters.classes.includes(cls)
                              ? 'default'
                              : 'ghost'
                          }
                          size="sm"
                          className="h-7 w-full justify-start text-xs sm:h-8 sm:text-sm"
                          onClick={() => toggleFilter('classes', cls)}
                        >
                          {selectedFilters.classes.includes(cls) && (
                            <Check className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-3.5 sm:w-3.5" />
                          )}
                          {cls}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h4 className="mb-2 flex items-center text-xs font-medium sm:text-sm">
                  <Stethoscope className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                  Medical Uses
                </h4>
                <ScrollArea className="h-[160px] rounded-md border p-2 sm:h-[180px]">
                  <div className="space-y-1">
                    {availableUses.map((use) => (
                      <div key={use} className="flex items-center">
                        <Button
                          variant={
                            selectedFilters.uses.includes(use)
                              ? 'default'
                              : 'ghost'
                          }
                          size="sm"
                          className="h-7 w-full justify-start text-xs sm:h-8 sm:text-sm"
                          onClick={() => toggleFilter('uses', use)}
                        >
                          {selectedFilters.uses.includes(use) && (
                            <Check className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-3.5 sm:w-3.5" />
                          )}
                          {use}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </Card>
        )}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <div className="h-20 bg-muted sm:h-24"></div>
              <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                <div className="h-5 w-2/3 rounded bg-muted sm:h-6"></div>
                <div className="space-y-2">
                  <div className="h-3 w-1/2 rounded bg-muted sm:h-4"></div>
                  <div className="h-3 w-3/4 rounded bg-muted sm:h-4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted sm:h-4"></div>
                  <div className="h-3 w-5/6 rounded bg-muted sm:h-4"></div>
                </div>
                <div className="flex items-center justify-between pt-3 sm:pt-4">
                  <div className="h-3 w-1/4 rounded bg-muted sm:h-4"></div>
                  <div className="h-7 w-20 rounded bg-muted sm:h-8 sm:w-24"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : medicines.length > 0 ? (
        <>
          <div className="grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">


            {medicines.map((medicine) => (
              <Card
                key={medicine.id}
                className={cn(
                  'overflow-hidden animate-fade-in transition-all duration-200',
                  expandedMedicine === medicine.id
                    ? 'md:col-span-2 lg:col-span-3'
                    : ''
                )}
              >
                <div className="gradient-bg p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap sm:gap-2">
                        <h3 className="line-clamp-1 text-sm font-semibold text-white sm:text-base">
                          {medicine.NAME}
                        </h3>
                        <Badge
                          className="h-5 border-none bg-white/20 px-1.5 text-[10px] text-white sm:text-xs"
                        >
                          {medicine.CLASS && medicine.CLASS.length > 0 ? medicine.CLASS[0] : 'Unknown'}
                        </Badge>

                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 sm:gap-2">
                        {medicine.CLASS.slice(1, 3).map((cls, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="h-5 border-white/20 bg-white/10 px-1.5 text-[10px] text-white sm:text-xs"
                          >
                            {cls}
                          </Badge>
                        ))}
                        {medicine.CLASS.length > 3 && (
                          <Badge
                            variant="outline"
                            className="h-5 border-white/20 bg-white/10 px-1.5 text-[10px] text-white sm:text-xs"
                          >
                            +{medicine.CLASS.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-white hover:text-white/80 sm:h-8 sm:w-8"
                        onClick={() => handleFavoriteToggle(medicine)}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            isFavorite(medicine.id) ? 'fill-current' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-white hover:text-white/80 sm:h-8 sm:w-8"
                        onClick={() => toggleExpand(medicine.id)}
                      >
                        {expandedMedicine === medicine.id ? (
                          <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                      <div className="flex-1">
                        <p className="mb-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                          Uses:
                        </p>
                        <ul className="space-y-1">
                          {medicine.Uses.map((use, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1 text-xs sm:text-sm"
                            >
                              <span className="text-primary">•</span>
                              <span>{use}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {expandedMedicine !== medicine.id && (
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive sm:h-4 sm:w-4" />
                        <div className="flex-1">
                          <p className="mb-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                            Side Effects:
                          </p>
                          <p className="line-clamp-1 text-xs sm:text-sm">
                            {medicine.SIDEEFFECT.slice(0, 3).join(', ')}
                            {medicine.SIDEEFFECT.length > 3 && '...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {expandedMedicine === medicine.id && (
                    <div className="space-y-4 pt-2 animate-in fade-in-0 duration-200">
                      <div className="border-t"></div>

                      <div className="space-y-2">
                        <h4 className="flex items-center text-xs font-medium sm:text-sm">
                          <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-destructive sm:mr-2 sm:h-4 sm:w-4" />
                          Side Effects
                        </h4>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 sm:gap-x-4">
                          {medicine.SIDEEFFECT.map((effect, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-1 text-xs sm:text-sm"
                            >
                              <span className="text-destructive">•</span>
                              <span>{effect}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* <div className="space-y-2">
                        <h4 className="flex items-center text-xs font-medium sm:text-sm">
                          <Layers className="mr-1.5 h-3.5 w-3.5 text-primary sm:mr-2 sm:h-4 sm:w-4" />
                          Alternative Names
                        </h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          
                        </div>
                      </div> */}

                      <div className="space-y-2">
                        <h4 className="flex items-center text-xs font-medium sm:text-sm">
                          <Tag className="mr-1.5 h-3.5 w-3.5 text-primary sm:mr-2 sm:h-4 sm:w-4" />
                          Medicine Classes
                        </h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {medicine.CLASS.map((cls, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] sm:text-xs"
                            >
                              {cls}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs sm:h-8 sm:gap-2 sm:text-sm"
                          onClick={() =>
                            handleCopyToClipboard(
                              `${medicine.NAME}\nUses: ${medicine.Uses.join(
                                ', '
                              )}\nSide Effects: ${medicine.SIDEEFFECT.join(
                                ', '
                              )}` // تم حذف Alternatives من هنا
                            )
                          }
                        >
                          <Clipboard className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          Copy Info
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs sm:h-8 sm:gap-2 sm:text-sm"
                        >
                          <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 text-xs sm:h-8 sm:gap-2 sm:text-sm"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center gap-2 sm:mt-8">
              <div className="flex flex-wrap justify-center gap-2">
                {renderPaginationButtons()}
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(currentPage * ITEMS_PER_PAGE, medicines.length)} of{' '}
                {medicines.length} results
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">No medicines found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters to find what you&apos;re looking for
          </p>
          {(searchQuery ||
            selectedFilters.classes.length > 0 ||
            selectedFilters.uses.length > 0) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}